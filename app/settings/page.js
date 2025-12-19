'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    image: '',
    banner: '',
    about: ''
  });

  // Fetch current user data on mount
  useEffect(() => {
    if (session?.user?.name) {
      // We need to fetch the latest user data because session might be stale regarding 'about' or 'banner'
      // if they aren't in the session token.
      fetch(`/api/u/${session.user.name}`)
        .then(res => res.json())
        .then(data => {
          setFormData({
            username: data.username || '',
            image: data.image || '',
            banner: data.banner || '',
            about: data.about || ''
          });
        })
        .catch(err => console.error(err));
    }
  }, [session]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional: Add strictly local preview before upload if preferred, 
    // but user wanted "upload from device and updated in database", so uploading to get URL is logical.

    // We can show a loading state specifically for uploads if we want, 
    // but for now we'll rely on the visual feedback of the image updating.
    setIsLoading(true);

    const data = new FormData();
    data.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data
      });

      if (!res.ok) throw new Error('Upload failed');

      const json = await res.json();
      setFormData(prev => ({ ...prev, [field]: json.url }));
    } catch (err) {
      console.error(err);
      setMessage('Failed to upload image.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    // Client-side Validation
    const { username } = formData;

    if (!username || username.trim().length < 4) {
      setMessage('Username must be at least 4 characters.');
      setIsLoading(false);
      return;
    }

    if (!/^[a-zA-Z]/.test(username)) {
      setMessage('Username must start with a letter.');
      setIsLoading(false);
      return;
    }

    // Password Validation (only if provided)
    const { password, confirmPassword } = formData;
    if (password) {
      if (password.length < 6) {
        setMessage('Password must be at least 6 characters.');
        setIsLoading(false);
        return;
      }
      if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
        setMessage('Password must contain both letters and numbers.');
        setIsLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setMessage('Passwords do not match.');
        setIsLoading(false);
        return;
      }
    }

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setMessage('Settings updated successfully!');
        // Update session with new username and image so UI reflects it immediately
        await update({
          username: formData.username,
          image: formData.image
        });
        router.refresh();
      } else {
        const errorData = await res.json();
        setMessage(errorData.message || 'Failed to update settings.');
      }
    } catch (error) {
      console.error(error);
      setMessage('An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action is irreversible and you will lose all your data.')) {
      try {
        const res = await fetch('/api/settings', {
          method: 'DELETE',
        });

        if (res.ok) {
          // Force sign out and redirect
          window.location.href = '/';
          // We use window.location to ensure a full refresh/clearing of state, 
          // although signOut() is cleaner in NextAuth, sometimes a hard redirect is safer for deletion.
          // But let's stick to standard next-auth signOut for proper cleanup.
          import('next-auth/react').then(({ signOut }) => {
            signOut({ callbackUrl: '/' });
          });
        } else {
          setMessage('Failed to delete account.');
        }
      } catch (error) {
        console.error('Delete error:', error);
        setMessage('An error occurred.');
      }
    }
  };

  if (!session) {
    return <div className="container" style={{ padding: '20px' }}>Please log in to view settings.</div>;
  }

  return (
    <div className="container" style={{ maxWidth: '600px', marginTop: '40px', paddingBottom: '40px' }}>
      <div className="card">
        <h1 style={{ marginBottom: '20px' }}>User Settings</h1>

        {message && (
          <div style={{
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '20px',
            background: message.includes('success') ? 'rgba(70, 209, 96, 0.1)' : 'rgba(255, 69, 0, 0.1)',
            color: message.includes('success') ? '#46D160' : '#FF4500'
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* ... existing form fields ... */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Username <span style={{ color: 'red' }}>*</span></label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="input-field"
              placeholder="Username"
            />
            <p style={{ fontSize: '12px', color: 'var(--color-text-dim)', marginTop: '4px' }}>
              Must be at least 4 characters, start with a letter, and be unique. Changing this will change your login!
            </p>
          </div>

          <div style={{ marginBottom: '20px', borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Change Password</h3>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>New Password</label>
            <input
              type="password"
              name="password"
              value={formData.password || ''}
              onChange={handleChange}
              className="input-field"
              placeholder="New Password"
            />
            <p style={{ fontSize: '12px', color: 'var(--color-text-dim)', marginTop: '4px' }}>
              Min 6 chars, must include letters and numbers. Leave empty to keep current.
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword || ''}
              onChange={handleChange}
              className="input-field"
              placeholder="Confirm New Password"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Profile Image</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {formData.image && (
                <img src={formData.image} alt="Profile" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'image')}
                className="input-field"
                style={{ padding: '8px' }}
              />
            </div>
            {formData.image && (
              <p style={{ fontSize: '12px', color: 'var(--color-text-dim)', marginTop: '4px' }}>
                Current Image URL: {formData.image}
              </p>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Banner Image</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {formData.banner && (
                <img src={formData.banner} alt="Banner" style={{ width: '100%', height: '100px', borderRadius: '4px', objectFit: 'cover' }} />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'banner')}
                className="input-field"
                style={{ padding: '8px' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>About (Bio)</label>
            <textarea
              name="about"
              value={formData.about}
              onChange={handleChange}
              className="input-field"
              rows="4"
              placeholder="Tell us about yourself..."
            ></textarea>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        {/* Danger Zone */}
        <div style={{ marginTop: '40px', borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
          <h3 style={{ color: '#FF4500', marginBottom: '10px' }}>Danger Zone</h3>
          <p style={{ fontSize: '14px', color: 'var(--color-text-dim)', marginBottom: '16px' }}>
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button
            type="button"
            className="btn"
            style={{
              borderColor: '#FF4500',
              color: '#FF4500',
              background: 'transparent',
              fontWeight: 'bold'
            }}
            onClick={handleDeleteAccount}
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
