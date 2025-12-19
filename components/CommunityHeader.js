'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaBell, FaRegBell, FaEllipsisH, FaPlus, FaStar, FaVolumeMute } from 'react-icons/fa';
import styles from './CommunityHeader.module.css';
import AddToFeedModal from './AddToFeedModal';

export default function CommunityHeader({ community }) {
    const { data: session } = useSession();
    const router = useRouter();

    const isMember = session && community.members.includes(session.user.id);
    const [joined, setJoined] = useState(isMember);
    const [loading, setLoading] = useState(false);

    // UI State
    const [bellOpen, setBellOpen] = useState(false);
    const [dotsOpen, setDotsOpen] = useState(false);
    const [isFeedModalOpen, setIsFeedModalOpen] = useState(false);
    const [notificationLevel, setNotificationLevel] = useState('low'); // 'off', 'low', 'all'

    const bellRef = useRef(null);
    const dotsRef = useRef(null);

    // Close menus on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (bellRef.current && !bellRef.current.contains(event.target)) {
                setBellOpen(false);
            }
            if (dotsRef.current && !dotsRef.current.contains(event.target)) {
                setDotsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleJoin = async () => {
        if (!session) {
            router.push('/?login=true');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/communities/${community.name}/join`, {
                method: 'POST',
            });

            if (res.ok) {
                const data = await res.json();
                setJoined(data.isMember);
                router.refresh();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFavorite = async () => {
        if (!session) return router.push('/?login=true');

        try {
            await fetch('/api/user/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ communityName: community.name })
            });
            alert('Favorites updated!'); // Simple feedback for now
            setDotsOpen(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddToCustomFeed = () => {
        if (!session) return router.push('/?login=true');
        setDotsOpen(false);
        setIsFeedModalOpen(true);
    };

    // Use schema themeColor or fallback
    const themeColor = community.themeColor || '#0079D3';

    return (
        <div>
            {/* Banner Area */}
            <div
                className={styles.banner}
                style={{
                    backgroundColor: themeColor,
                    backgroundImage: community.banner ? `url(${community.banner})` : 'none'
                }}
            ></div>

            <div className={styles.container}>
                <div className={styles.contentWrapper}>
                    {/* Icon */}
                    <div className={styles.iconWrapper}>
                        {community.icon ? (
                            <img src={community.icon} alt={community.name} className={styles.icon} />
                        ) : (
                            <div className={styles.icon} style={{ backgroundColor: themeColor }}>
                                r/
                            </div>
                        )}
                    </div>

                    <div className={styles.headerContent}>
                        <div className={styles.titleSection}>
                            <h1 className={styles.title}>
                                {community.title || community.name}
                            </h1>
                            <span className={styles.subTitle}>r/{community.name}</span>
                        </div>

                        <div className={styles.actions}>
                            {joined && (
                                <Link href={`/submit?community=${community.name}`}>
                                    <button className="btn btn-outline" style={{ borderRadius: '999px', fontWeight: 'bold' }}>Create Post</button>
                                </Link>
                            )}

                            {/* Bell Button */}
                            <div style={{ position: 'relative' }} ref={bellRef}>
                                <button
                                    className={`${styles.iconBtn} ${bellOpen ? styles.active : ''}`}
                                    onClick={() => setBellOpen(!bellOpen)}
                                >
                                    {notificationLevel === 'off' ? <FaRegBell /> : <FaBell />}
                                </button>
                                {bellOpen && (
                                    <div className={styles.dropdown}>
                                        <button className={styles.dropdownItem} onClick={() => { setNotificationLevel('off'); setBellOpen(false); }}>
                                            <FaRegBell /> Off
                                        </button>
                                        <button className={styles.dropdownItem} onClick={() => { setNotificationLevel('low'); setBellOpen(false); }}>
                                            <FaBell /> Low
                                        </button>
                                        <button className={styles.dropdownItem} onClick={() => { setNotificationLevel('all'); setBellOpen(false); }}>
                                            <FaBell style={{ color: 'var(--color-primary)' }} /> All
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleJoin}
                                disabled={loading}
                                className={`btn ${joined ? 'btn-outline' : 'btn-primary'} ${styles.joinBtn}`}
                            >
                                {loading ? '...' : (joined ? 'Joined' : 'Join')}
                            </button>

                            {/* Three Dots Button */}
                            <div style={{ position: 'relative' }} ref={dotsRef}>
                                <button
                                    className={`${styles.iconBtn} ${dotsOpen ? styles.active : ''}`}
                                    onClick={() => setDotsOpen(!dotsOpen)}
                                >
                                    <FaEllipsisH />
                                </button>
                                {dotsOpen && (
                                    <div className={styles.dropdown}>
                                        <button className={styles.dropdownItem} onClick={handleAddToCustomFeed}>
                                            <FaPlus /> Add to custom feed
                                        </button>
                                        <button className={styles.dropdownItem} onClick={handleFavorite}>
                                            <FaStar /> Add to favorites
                                        </button>
                                        <button className={styles.dropdownItem} onClick={() => setDotsOpen(false)}>
                                            <FaVolumeMute /> Mute r/{community.name}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AddToFeedModal
                isOpen={isFeedModalOpen}
                onClose={() => setIsFeedModalOpen(false)}
                communityName={community.name}
            />
        </div>
    );
}
