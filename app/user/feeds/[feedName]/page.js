'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PostCard from '@/components/PostCard';
import { FaStar } from 'react-icons/fa';

export default function CustomFeedPage() {
    const { feedName } = useParams();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await fetch(`/api/user/feeds/${feedName}/posts`);
                if (res.ok) {
                    const data = await res.json();
                    setPosts(data.posts);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (feedName) {
            fetchPosts();
        }
    }, [feedName]);

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <div style={{
                marginBottom: '24px',
                borderBottom: '1px solid var(--color-border)',
                paddingBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}>
                <div style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '4px solid var(--color-surface)'
                }}>
                    <FaStar size={32} style={{ color: '#FFD700' }} />
                </div>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>{decodeURIComponent(feedName)}</h1>
                    <p style={{ color: 'var(--color-text-dim)', fontSize: '14px' }}>Custom Feed</p>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Loading feed...</div>
            ) : posts.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {posts.map(post => (
                        <PostCard key={post._id} post={post} />
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-dim)' }}>
                    No posts in this feed yet. Add some communities!
                </div>
            )}
        </div>
    );
}
