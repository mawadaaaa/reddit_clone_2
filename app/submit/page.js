'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styles from './Submit.module.css';
import { FaImage, FaLink, FaPoll, FaAngleDown } from 'react-icons/fa';

export default function SubmitPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('post');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/?login=true');
    } else if (status === 'authenticated') {
      fetchCommunities();
    }
  }, [status, router]);

  const fetchCommunities = async () => {
    try {
      const res = await fetch('/api/communities');
      if (res.ok) {
        const data = await res.json();
        setCommunities(data);
        // Pre-select if only one (optional logic)
      }
    } catch (err) {
      console.error('Failed to fetch communities');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCommunity) {
      setError('Please select a community');
      return;
    }

    try {
      const res = await fetch(`/api/communities/${selectedCommunity.name}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content: body
          // Image/Link/Poll logic can be expanded here
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || 'Failed to create post');
        return;
      }

      router.push(`/r/${selectedCommunity.name}`);
    } catch (err) {
      setError('Something went wrong');
    }
  };

  if (status === 'loading' || loading) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Create a post</h1>
        <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#ff4500' }}>Drafts <span style={{ color: '#878A8C', fontWeight: 'normal' }}>0</span></div>
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.mainColumn}>
          <div className={styles.dropdownContainer}>
            <div
              className={styles.communitySelector}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {selectedCommunity ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {selectedCommunity.icon ? (
                    <img src={selectedCommunity.icon} className={styles.circleImage} alt="" />
                  ) : (
                    <div className={styles.circleImage} style={{ background: selectedCommunity.themeColor || '#0079D3' }} />
                  )}
                  <span style={{ fontWeight: '500' }}>r/{selectedCommunity.name}</span>
                </div>
              ) : (
                <span style={{ color: 'var(--color-text-main)' }}>Select a community</span>
              )}
              <FaAngleDown color="var(--color-text-secondary)" />
            </div>

            {isDropdownOpen && (
              <div className={styles.dropdownMenu}>
                <div style={{ padding: '8px 12px', fontSize: '12px', fontWeight: 'bold', color: '#878A8C' }}>YOUR COMMUNITIES</div>
                {communities.map((comm) => (
                  <div
                    key={comm._id}
                    className={styles.dropdownItem}
                    onClick={() => {
                      setSelectedCommunity(comm);
                      setIsDropdownOpen(false);
                      setError('');
                    }}
                  >
                    {comm.icon ? (
                      <img src={comm.icon} className={styles.circleImage} alt="" />
                    ) : (
                      <div className={styles.circleImage} style={{ background: comm.themeColor || '#0079D3' }} />
                    )}
                    <span style={{ fontWeight: '500' }}>r/{comm.name}</span>
                    <span style={{ fontSize: '12px', color: '#878A8C', marginLeft: 'auto' }}>{comm.members?.length || 0} members</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.card}>
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${activeTab === 'post' ? styles.active : ''}`}
                onClick={() => setActiveTab('post')}
              >
                Post
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'image' ? styles.active : ''}`}
                onClick={() => setActiveTab('image')}
              >
                <FaImage /> Images & Video
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'link' ? styles.active : ''}`}
                onClick={() => setActiveTab('link')}
              >
                <FaLink /> Link
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'poll' ? styles.active : ''}`}
                onClick={() => setActiveTab('poll')}
                disabled
                style={{ opacity: 0.5, cursor: 'not-allowed' }}
              >
                <FaPoll /> Poll
              </button>
            </div>

            <div className={styles.formContainer}>
              {error && <div className={styles.error}>{error}</div>}
              <input
                type="text"
                placeholder="Title"
                className={styles.inputField}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={300}
              />

              <div className={`${styles.toolbar} ${styles.darkToolbar}`}>
                {/* Just visual placeholders for rich text toolbar */}
                <span style={{ fontWeight: 'bold', padding: '0 8px', cursor: 'pointer' }}>B</span>
                <span style={{ fontStyle: 'italic', padding: '0 8px', cursor: 'pointer' }}>i</span>
                <span style={{ textDecoration: 'underline', padding: '0 8px', cursor: 'pointer' }}>u</span>
              </div>

              <textarea
                placeholder="Body text (optional)"
                className={styles.textarea}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />

              <div className={styles.actions}>
                <button className="btn btn-outline">Save Draft</button>
                <button
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={!title || !selectedCommunity}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar area - hidden on mobile usually, or contains rules */}
        <div style={{ width: '312px', display: 'none' }}>
          {/* Placeholder for Posting Rules Sidebar */}
        </div>
      </div>
    </div>
  );
}
