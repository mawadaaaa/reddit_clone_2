'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styles from '@/app/submit/Submit.module.css'; // Use the Dark Mode styles
import { FaImage, FaLink, FaPoll } from 'react-icons/fa';

export default function SubmitPage({ params }) {
    const { name } = use(params);
    const { data: session, status } = useSession();
    const router = useRouter();

    // State from original community page (Functionality)
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState('');
    const [video, setVideo] = useState('');
    const [activeTab, setActiveTab] = useState('post'); // 'post' (text), 'image', 'link'
    const [error, setError] = useState('');
    const [communityDetails, setCommunityDetails] = useState(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/?login=true');
        } else if (status === 'authenticated') {
            fetchCommunityDetails();
        }
    }, [status, router, name]);

    const fetchCommunityDetails = async () => {
        try {
            const res = await fetch(`/api/communities/${name}`);
            if (res.ok) {
                const data = await res.json();
                setCommunityDetails(data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError('File too large (max 5MB)');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
                setError('');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/communities/${name}/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    content: activeTab === 'image' ? (content || ' ') : content,
                    image: activeTab === 'image' ? image : '',
                    video: activeTab === 'image' ? video : ''
                    // Link/Poll logic can be added here
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.message || 'Failed to create post');
                return;
            }

            router.push(`/r/${name}`);
            router.refresh();
        } catch (err) {
            setError('Something went wrong');
        }
    };

    if (status === 'loading') return <div>Loading...</div>;
    if (!session) return null;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.pageTitle}>Create a post</h1>
                <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#ff4500' }}>Drafts <span style={{ color: '#878A8C', fontWeight: 'normal' }}>0</span></div>
            </div>

            <div className={styles.contentWrapper}>
                <div className={styles.mainColumn}>
                    {/* Community "Selector" - Static Display for this page */}
                    <div className={styles.dropdownContainer}>
                        <div className={styles.communitySelector} style={{ cursor: 'default' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {communityDetails?.icon ? (
                                    <img src={communityDetails.icon} className={styles.circleImage} alt="" />
                                ) : (
                                    <div className={styles.circleImage} style={{ background: communityDetails?.themeColor || '#0079D3' }} />
                                )}
                                <span style={{ fontWeight: '500' }}>r/{name}</span>
                            </div>
                        </div>
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

                            {activeTab === 'post' && (
                                <>

                                    <textarea
                                        placeholder="Body text (optional)"
                                        className={styles.textarea}
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        rows={10}
                                    />
                                </>
                            )}

                            {activeTab === 'image' && (
                                <div style={{ border: '1px dashed #343536', padding: '20px', borderRadius: '4px', textAlign: 'center', marginTop: '16px' }}>
                                    {!image && !video ? (
                                        <div>
                                            <label className="btn btn-outline" style={{ cursor: 'pointer', display: 'inline-block', marginBottom: '10px', color: 'var(--color-text-main)', borderColor: 'var(--color-text-main)' }}>
                                                Upload Image
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    style={{ display: 'none' }}
                                                />
                                            </label>
                                            <p style={{ margin: '10px 0', fontWeight: 'bold', color: 'var(--color-text-dim)' }}>OR</p>
                                            <input
                                                type="url"
                                                placeholder="Paste Image URL"
                                                className={styles.inputField}
                                                onChange={(e) => setImage(e.target.value)}
                                                style={{ width: '100%', marginBottom: '10px' }}
                                            />
                                            <p style={{ margin: '10px 0', fontWeight: 'bold', color: 'var(--color-text-dim)' }}>OR</p>
                                            <input
                                                type="url"
                                                placeholder="Paste Video URL (e.g., mp4 link)"
                                                className={styles.inputField}
                                                onChange={(e) => setVideo(e.target.value)}
                                                style={{ width: '100%' }}
                                            />
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
                                <div style={{ marginTop: '16px', color: 'var(--color-text-dim)' }}>
                                    Link posting not yet implemented.
                                </div>
                            )}

                            <div className={styles.actions}>
                                <button className="btn btn-outline" onClick={() => router.back()}>Cancel</button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSubmit}
                                    disabled={!title}
                                >
                                    Post
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ width: '312px', display: 'none' }} className="desktop-sidebar">
                    {/* Sidebar placeholder */}
                </div>
            </div>
        </div>
    );
}
