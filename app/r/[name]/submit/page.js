'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styles from '@/app/login/Auth.module.css';
import { FaImage, FaLink } from 'react-icons/fa';

export default function SubmitPage({ params }) {
    const { data: session, status } = useSession();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState(''); // Stores URL or Base64
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState('text'); // 'text' or 'image'
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/?login=true');
        }
    }, [status, router]);

    if (status === 'loading') return <div>Loading...</div>;
    if (!session) return null;

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
            const res = await fetch(`/api/communities/${params.name}/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    content: activeTab === 'image' ? (content || ' ') : content, // Allow empty content if image
                    image: activeTab === 'image' ? image : ''
                }),
            });

            if (!res.ok) {
                setError('Failed to create post');
                return;
            }

            router.push(`/r/${params.name}`);
            router.refresh();
        } catch (err) {
            setError('Something went wrong');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card} style={{ maxWidth: '700px' }}>
                <h1 className={styles.title}>Create Post in r/{params.name}</h1>
                {error && <div className={styles.error}>{error}</div>}

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid #edeff1', marginBottom: '16px' }}>
                    <button
                        onClick={() => setActiveTab('text')}
                        style={{
                            padding: '10px 20px',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'text' ? '2px solid #0079D3' : 'none',
                            color: activeTab === 'text' ? '#0079D3' : '#878A8C',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Post
                    </button>
                    <button
                        onClick={() => setActiveTab('image')}
                        style={{
                            padding: '10px 20px',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'image' ? '2px solid #0079D3' : 'none',
                            color: activeTab === 'image' ? '#0079D3' : '#878A8C',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <FaImage /> Images & Video
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <input
                        type="text"
                        placeholder="Title"
                        className="input-field"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={300}
                        required
                        style={{ fontSize: '1.2rem' }}
                    />

                    {activeTab === 'text' && (
                        <textarea
                            placeholder="Text (optional)"
                            className="input-field"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={10}
                        />
                    )}

                    {activeTab === 'image' && (
                        <div style={{ border: '1px dashed #edeff1', padding: '20px', borderRadius: '4px', textAlign: 'center' }}>
                            {!image ? (
                                <div>
                                    <label className="btn btn-outline" style={{ cursor: 'pointer', display: 'inline-block', marginBottom: '10px' }}>
                                        Upload Image
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                    <p style={{ margin: '10px 0' }}>OR</p>
                                    <input
                                        type="url"
                                        placeholder="Paste Image URL"
                                        className="input-field"
                                        onChange={(e) => setImage(e.target.value)}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            ) : (
                                <div style={{ position: 'relative' }}>
                                    <img src={image} alt="Preview" style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '4px' }} />
                                    <button
                                        type="button"
                                        onClick={() => setImage('')}
                                        style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer' }}
                                    >
                                        ×
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => router.back()}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={!title}>
                            Post
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
