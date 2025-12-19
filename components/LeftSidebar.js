'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaHome, FaChartLine, FaCompass, FaBook, FaReddit, FaBalanceScale, FaUniversalAccess, FaChevronDown, FaChevronUp, FaCog, FaStar, FaRegStar, FaPlus } from 'react-icons/fa';
import styles from './LeftSidebar.module.css';
import { useUI } from '@/context/UIContext';

export default function LeftSidebar() {
    const pathname = usePathname();
    const { isSidebarOpen } = useUI();
    const { data: session } = useSession(); // Add session
    const [isCommunitiesOpen, setIsCommunitiesOpen] = useState(true);

    // State for dynamic data
    const [favorites, setFavorites] = useState([]);
    const [customFeeds, setCustomFeeds] = useState([]);

    // Fetch user data
    useEffect(() => {
        if (session) {
            fetch('/api/user/favorites').then(res => res.json()).then(data => {
                if (Array.isArray(data)) setFavorites(data);
            });
            fetch('/api/user/custom-feeds').then(res => res.json()).then(data => {
                if (Array.isArray(data)) setCustomFeeds(data);
            });
        }
    }, [session]);

    const communities = [
        { name: 'r/CallOfDuty', icon: null },
        { name: 'r/DaniDev', icon: null },
        { name: 'r/Minecraft', icon: null },
        { name: 'r/Warzone', icon: null },
        { name: 'r/AlexandriaEgy', icon: null },
        { name: 'r/Amd', icon: null },
        { name: 'r/anime', icon: null },
        { name: 'r/announcements', icon: null },
        { name: 'r/apexlegends', icon: null },
        { name: 'r/ArcRaiders', icon: null },
        { name: 'r/assassinscreed', icon: null },
        { name: 'r/AskReddit', icon: null },
        { name: 'r/no', icon: null },
    ];

    // Helper to check if a community is favorited
    const isFavorited = (communityName) => {
        // Handle "r/" prefix if present in the source list
        const cleanName = communityName.replace(/^r\//, '');
        return favorites.some(fav => fav.name === cleanName);
    };

    const toggleFavorite = async (e, communityName) => {
        e.preventDefault(); // Prevent navigation when clicking star
        e.stopPropagation();

        const cleanName = communityName.replace(/^r\//, '');
        const isFav = isFavorited(cleanName);

        // Optimistic Update
        let newFavorites;
        if (isFav) {
            newFavorites = favorites.filter(fav => fav.name !== cleanName);
        } else {
            // We need to add it. We might not have the icon here if it's from the static list without fetching.
            // But we can add a placeholder and let the next fetch fix it, or try to find it.
            newFavorites = [...favorites, { name: cleanName, icon: null }];
        }
        setFavorites(newFavorites);

        try {
            const res = await fetch('/api/user/favorites', {
                method: isFav ? 'DELETE' : 'POST', // Use DELETE for removing, POST for adding
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ communityName: cleanName }),
            });

            if (!res.ok) {
                // Revert if failed
                if (isFav) {
                    // Was fav, failed to delete -> add back
                    // We need to re-fetch to get correct data ideally, or just revert state
                    // For simplicity, re-fetching is safer
                    fetch('/api/user/favorites').then(r => r.json()).then(setFavorites);
                } else {
                    // Was not fav, failed to add -> remove
                    setFavorites(favorites.filter(f => f.name !== cleanName));
                }
            } else {
                // Success - essentially confirmed. 
                // If we added it, maybe we want to fetch details (icon) eventually?
                // For now, optimistic update is fine.
            }
        } catch (error) {
            console.error('Failed to toggle favorite', error);
        }
    };

    if (!isSidebarOpen) return null;

    const isActive = (path) => pathname === path ? styles.active : '';

    return (
        <aside className={styles.sidebar}>
            <div className={styles.section}>
                <Link href="/" className={`${styles.link} ${isActive('/')}`}>
                    <FaHome size={20} />
                    Home
                </Link>
                <Link href="/popular" className={`${styles.link} ${isActive('/popular')}`}>
                    <FaChartLine size={20} />
                    Popular
                </Link>
                <Link href="/explore" className={`${styles.link} ${isActive('/explore')}`}>
                    <FaCompass size={20} />
                    Explore
                </Link>
            </div>

            <div className={styles.separator} />

            {/* Custom Feeds Section */}
            {customFeeds.length > 0 && (
                <>
                    <div className={styles.section}>
                        <h3 className={styles.title}>CUSTOM FEEDS</h3>
                        {customFeeds.map((feed, idx) => (
                            <Link key={idx} href={`/user/feeds/${feed.name}`} className={styles.link}>
                                <FaStar size={20} style={{ color: '#FFD700' }} />
                                {feed.name}
                            </Link>
                        ))}
                    </div>
                    <div className={styles.separator} />
                </>
            )}

            {/* Favorites Section */}
            {favorites.length > 0 && (
                <>
                    <div className={styles.section}>
                        <h3 className={styles.title}>FAVORITES</h3>
                        {favorites.map((fav, idx) => (
                            <Link key={idx} href={`/r/${fav.name}`} className={styles.link}>
                                <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                                    {fav.icon ? <img src={fav.icon} style={{ width: 20, height: 20, borderRadius: '50%', marginRight: 10 }} /> : <FaReddit size={20} style={{ marginRight: 10 }} />}
                                    r/{fav.name}
                                </div>
                                <div
                                    onClick={(e) => toggleFavorite(e, fav.name)}
                                    style={{ padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                >
                                    <FaStar size={14} style={{ color: '#FFD700' }} />
                                </div>
                            </Link>
                        ))}
                    </div>
                    <div className={styles.separator} />
                </>
            )}

            <div className={styles.section}>
                <h3 className={styles.title}>RESOURCES</h3>
                <Link href="/about" className={styles.link}>
                    <FaReddit size={20} />
                    About Reddit
                </Link>
                <Link href="/help" className={styles.link}>
                    <FaBook size={20} />
                    Help
                </Link>
            </div>

            <div className={styles.separator} />


            <div className={styles.section}>
                <div
                    className={styles.dropdownHeader}
                    onClick={() => setIsCommunitiesOpen(!isCommunitiesOpen)}
                >
                    <span className={styles.dropdownTitle}>COMMUNITIES</span>
                    {isCommunitiesOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                </div>

                {isCommunitiesOpen && (
                    <div className={styles.dropdownContent}>
                        <Link href="/communities" className={styles.dropdownItem}>
                            <FaCog size={16} />
                            Manage Communities
                        </Link>
                        <Link href="/r/create" className={styles.dropdownItem}>
                            <FaPlus size={16} />
                            Create Community
                        </Link>
                        {communities.map((community, idx) => {
                            const isFav = isFavorited(community.name);
                            return (
                                <Link key={idx} href={`/${community.name.replace('r/', 'r/')}`} className={styles.dropdownItem}>
                                    <div className={styles.communityIconWrapper}>
                                        {/* Placeholder for community icon */}
                                        {community.icon ? <img src={community.icon} alt="" /> : <FaReddit size={20} />}
                                    </div>
                                    <span className={styles.communityName}>{community.name}</span>
                                    <div
                                        onClick={(e) => toggleFavorite(e, community.name)}
                                        className={styles.starIconContainer}
                                        style={{ marginLeft: 'auto', padding: '4px', cursor: 'pointer', display: 'flex' }}
                                    >
                                        {isFav ? (
                                            <FaStar size={14} style={{ color: '#FFD700' }} />
                                        ) : (
                                            <FaRegStar className={styles.starIcon} size={14} />
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className={styles.separator} />

            <div className={styles.section}>
                <Link href="/communities" className={styles.link}>
                    <FaChartLine size={20} />
                    Communities
                </Link>
                <Link href="/best" className={styles.link}>
                    <FaChartLine size={20} />
                    Best of Reddit
                </Link>
                <Link href="/topics/pt" className={styles.link}>
                    <FaCompass size={20} />
                    Best of Reddit in Port...
                </Link>
                <Link href="/topics/de" className={styles.link}>
                    <FaCompass size={20} />
                    Best of Reddit in Ger...
                </Link>
            </div>


            <div className={styles.separator} />

            <div className={styles.section}>
                <Link href="/rules" className={styles.link}>
                    <FaBook size={20} />
                    Reddit Rules
                </Link>
                <Link href="/privacy" className={styles.link}>
                    <FaBook size={20} />
                    Privacy Policy
                </Link>
                <Link href="/user-agreement" className={styles.link}>
                    <FaBalanceScale size={20} />
                    User Agreement
                </Link>
                <Link href="/accessibility" className={styles.link}>
                    <FaUniversalAccess size={20} />
                    Accessibility
                </Link>
                <div className={styles.footer}>
                    Reddit, Inc. © 2025. All rights reserved.
                </div>
            </div>
        </aside>
    );
}
