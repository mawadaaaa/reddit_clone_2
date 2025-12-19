'use client';

import { useState, useEffect } from 'react';
import { FaTrash, FaStar, FaChevronDown, FaChevronUp, FaTimes } from 'react-icons/fa';
import Link from 'next/link';

export default function ProfileManager({ user, isOwnProfile }) {
    const [favorites, setFavorites] = useState([]);
    const [feeds, setFeeds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedFeed, setExpandedFeed] = useState(null);

    useEffect(() => {
        if (isOwnProfile) {
            fetchData();
        }
    }, [isOwnProfile]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [favRes, feedRes] = await Promise.all([
                fetch('/api/user/favorites'),
                fetch('/api/user/custom-feeds')
            ]);
            const favData = await favRes.json();
            const feedData = await feedRes.json();

            setFavorites(Array.isArray(favData) ? favData : []);
            setFeeds(Array.isArray(feedData) ? feedData : []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFavorite = async (communityId) => {
        if (!confirm('Remove from favorites?')) return;
        try {
            const res = await fetch('/api/user/favorites', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ communityId })
            });
            if (res.ok) {
                setFavorites(prev => prev.filter(f => f._id !== communityId));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteFeed = async (feedName) => {
        if (!confirm(`Delete custom feed "${feedName}"? This cannot be undone.`)) return;
        try {
            const res = await fetch('/api/user/custom-feeds', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ feedName })
            });
            if (res.ok) {
                setFeeds(prev => prev.filter(f => f.name !== feedName));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleRemoveFromFeed = async (feedName, communityId) => {
        if (!confirm('Remove community from this feed?')) return;
        try {
            const res = await fetch('/api/user/custom-feeds', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'remove_community',
                    feedName,
                    communityId
                })
            });
            if (res.ok) {
                // Optimistically update
                setFeeds(prev => prev.map(feed => {
                    if (feed.name === feedName) {
                        return {
                            ...feed,
                            communities: feed.communities.filter(c => c._id !== communityId)
                        };
                    }
                    return feed;
                }));
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (!isOwnProfile) return null;

    if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Favorites Section */}
            <div className="card" style={{ padding: '16px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>Manage Favorites</h3>
                {favorites.length === 0 ? (
                    <p style={{ color: 'var(--color-text-dim)' }}>No favorite communities yet.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {favorites.map(fav => (
                            <div key={fav._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Link href={`/r/${fav.name}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '500' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#272729', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {fav.icon ? <img src={fav.icon} style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : <span style={{ fontSize: '16px' }}>r/</span>}
                                    </div>
                                    r/{fav.name}
                                </Link>
                                <button
                                    onClick={() => handleRemoveFavorite(fav._id)}
                                    style={{ background: 'transparent', border: 'none', color: '#ff4500', cursor: 'pointer', padding: '8px' }}
                                    title="Remove from favorites"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Custom Feeds Section */}
            <div className="card" style={{ padding: '16px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>Manage Custom Feeds</h3>
                {feeds.length === 0 ? (
                    <p style={{ color: 'var(--color-text-dim)' }}>No custom feeds created.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {feeds.map(feed => (
                            <div key={feed.name} style={{ border: '1px solid var(--color-border)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div
                                    style={{
                                        padding: '12px', background: 'var(--color-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => setExpandedFeed(expandedFeed === feed.name ? null : feed.name)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <FaStar style={{ color: '#FFD700' }} />
                                        <span style={{ fontWeight: 'bold' }}>{feed.name}</span>
                                        <span style={{ fontSize: '12px', color: 'var(--color-text-dim)' }}>({feed.communities.length} communities)</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {expandedFeed === feed.name ? <FaChevronUp /> : <FaChevronDown />}
                                    </div>
                                </div>

                                {expandedFeed === feed.name && (
                                    <div style={{ padding: '12px', borderTop: '1px solid var(--color-border)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteFeed(feed.name); }}
                                                className="btn"
                                                style={{ backgroundColor: '#FF4500', color: 'white', fontSize: '12px', padding: '4px 12px' }}
                                            >
                                                Delete Feed
                                            </button>
                                        </div>

                                        {feed.communities.length === 0 ? (
                                            <p style={{ fontSize: '14px', color: 'var(--color-text-dim)' }}>No communities in this feed.</p>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                {feed.communities.map(comm => (
                                                    <div key={comm._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                                                        <Link href={`/r/${comm.name}`} style={{ fontSize: '14px' }}>r/{comm.name}</Link>
                                                        <button
                                                            onClick={() => handleRemoveFromFeed(feed.name, comm._id)}
                                                            style={{ color: '#878A8C', background: 'none', border: 'none', cursor: 'pointer' }}
                                                            title="Remove community"
                                                        >
                                                            <FaTimes />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}
