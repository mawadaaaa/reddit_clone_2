'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaTimes, FaStar } from 'react-icons/fa';

export default function AddToFeedModal({ isOpen, onClose, communityName }) {
    const [feeds, setFeeds] = useState([]);
    const [view, setView] = useState('list'); // 'list' | 'create'
    const [newFeedName, setNewFeedName] = useState('');
    const [loading, setLoading] = useState(false);

    // Fetch user feeds
    useEffect(() => {
        if (isOpen) {
            fetchFeeds();
        }
    }, [isOpen]);

    const fetchFeeds = async () => {
        try {
            const res = await fetch('/api/user/custom-feeds');
            const data = await res.json();
            if (Array.isArray(data)) setFeeds(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateFeed = async (e) => {
        e.preventDefault();
        if (!newFeedName.trim()) return;

        setLoading(true);
        try {
            const res = await fetch('/api/user/custom-feeds', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'create',
                    feedName: newFeedName
                })
            });
            if (res.ok) {
                // If created, go back to list and refresh
                setNewFeedName('');
                setView('list');
                await fetchFeeds();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToFeed = async (feedName) => {
        try {
            const res = await fetch('/api/user/custom-feeds', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'add_community',
                    feedName: feedName,
                    communityName: communityName
                })
            });
            if (res.ok) {
                // Refresh feeds to update "added" state logic if we had it
                fetchFeeds();
                // Optional: Show toast
            }
        } catch (error) {
            console.error(error);
        }
    }

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                backgroundColor: '#1A1A1B', width: '400px', borderRadius: '4px',
                border: '1px solid #343536', boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                color: 'var(--color-text-main)'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid #343536' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 500 }}>
                        {view === 'create' ? 'Create a custom feed' : 'Add to custom feed'}
                    </h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#878A8C', cursor: 'pointer' }}>
                        <FaTimes size={16} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '16px' }}>

                    {view === 'list' ? (
                        <>
                            {feeds.map(feed => (
                                <div key={feed._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: 32, height: 32, borderRadius: '4px', backgroundColor: '#272729', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <FaStar style={{ color: '#FFD700' }} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: 500 }}>{feed.name}</div>
                                            <div style={{ fontSize: '12px', color: '#878A8C' }}>{feed.communities.length} community</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleAddToFeed(feed.name)}
                                        style={{
                                            borderRadius: '999px', padding: '4px 16px', fontWeight: 700, fontSize: '14px',
                                            backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', cursor: 'pointer'
                                        }}
                                    >
                                        Add
                                    </button>
                                </div>
                            ))}

                            <div
                                onClick={() => setView('create')}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 0', marginTop: '16px' }}
                            >
                                <FaPlus size={16} />
                                <span style={{ fontSize: '14px', fontWeight: 500 }}>Create a custom feed</span>
                            </div>
                        </>
                    ) : (
                        <form onSubmit={handleCreateFeed}>
                            <input
                                type="text"
                                placeholder="Feed name (e.g. Gaming)"
                                value={newFeedName}
                                onChange={e => setNewFeedName(e.target.value)}
                                style={{
                                    width: '100%', padding: '8px 12px', backgroundColor: '#272729',
                                    border: '1px solid #343536', borderRadius: '4px', color: 'white', marginBottom: '16px'
                                }}
                                autoFocus
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                <button
                                    type="button"
                                    onClick={() => setView('list')}
                                    style={{ padding: '6px 16px', borderRadius: '999px', background: 'transparent', border: '1px solid #343536', color: '#878A8C', fontWeight: 700, cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newFeedName.trim() || loading}
                                    style={{ padding: '6px 16px', borderRadius: '999px', backgroundColor: 'var(--color-primary)', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.5 : 1 }}
                                >
                                    {loading ? 'Creating...' : 'Create Feed'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
