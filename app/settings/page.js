'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    displayName: '',
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
            displayName: data.displayName || '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setMessage('Settings updated successfully!');
        await update(); // Attempt to update session if strategies allow
        router.refresh();
      } else {
        setMessage('Failed to update settings.');
      }
    } catch (error) {
      console.error(error);
      setMessage('An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return <div className="container" style={{ padding: '20px' }}>Please log in to view settings.</div>;
  }

  return (
    <div className="container" style={{ maxWidth: '600px', marginTop: '40px' }}>
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
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Display Name</label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              className="input-field"
              placeholder="Display Name (optional)"
            />
            <p style={{ fontSize: '12px', color: 'var(--color-text-dim)', marginTop: '4px' }}>
              This name will be shown on your profile page.
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Profile Image URL</label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="input-field"
              placeholder="https://example.com/avatar.png"
            />
            <p style={{ fontSize: '12px', color: 'var(--color-text-dim)', marginTop: '4px' }}>
              Leave empty to use default avatar.
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Banner Image URL</label>
            <input
              type="text"
              name="banner"
              value={formData.banner}
              onChange={handleChange}
              className="input-field"
              placeholder="https://example.com/banner.png"
            />
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
      </div>
    </div>
  );
}
