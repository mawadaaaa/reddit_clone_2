'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styles from './Submit.module.css';
import { FaImage, FaLink, FaAngleDown } from 'react-icons/fa';

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

  const searchParams = useSearchParams();
  const communityParam = searchParams.get('community');

  const [image, setImage] = useState('');
  const [video, setVideo] = useState('');
  const [link, setLink] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/?login=true');
    } else if (status === 'authenticated') {
      fetchCommunities();
    }
  }, [status, router]);

  const fetchCommunities = async () => {
    try {
      const res = await fetch('/api/communities?joined=true');
      if (res.ok) {
        const data = await res.json();
        setCommunities(data);

        if (communityParam) {
          const preSelected = data.find(c => c.name === communityParam);
          if (preSelected) {
            setSelectedCommunity(preSelected);
          }
        }
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
          content: activeTab === 'image' || activeTab === 'link' ? (body || ' ') : body,
          image: activeTab === 'image' ? image : '',
          video: activeTab === 'image' ? video : '',
          link: activeTab === 'link' ? link : ''
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
                    <img src="/default-subreddit.png" className={styles.circleImage} alt="" />
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
                      <img src="/default-subreddit.png" className={styles.circleImage} alt="" />
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



              {activeTab === 'image' && (
                <div style={{ border: '1px dashed #343536', padding: '20px', borderRadius: '4px', textAlign: 'center', marginTop: '16px' }}>
                  {!image && !video ? (
                    <div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input
                          type="url"
                          placeholder="Paste Image URL"
                          className={styles.inputField}
                          value={image}
                          onChange={(e) => setImage(e.target.value)}
                        />
                        <input
                          type="url"
                          placeholder="Paste Video URL (e.g., mp4 link)"
                          className={styles.inputField}
                          value={video}
                          onChange={(e) => setVideo(e.target.value)}
                        />
                      </div>
                    </div>
                  ) : (
                    <div style={{ position: 'relative' }}>
                      {image && (
                        <img src={image} alt="Preview" style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '4px' }} />
                      )}
                      {video && (
                        <video controls style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '4px' }}>
                          <source src={video} />
                        </video>
                      )}
                      <button
                        type="button"
                        onClick={() => { setImage(''); setVideo(''); }}
                        style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer' }}
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'link' && (
                <div style={{ marginTop: '16px' }}>
                  <input
                    type="url"
                    placeholder="Url"
                    className={styles.inputField}
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                  />
                </div>
              )}



              <textarea
                placeholder="Body text (optional)"
                className={styles.textarea}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />

              <div className={styles.actions}>

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
