'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import styles from './Navbar.module.css';
import { FaReddit, FaBars, FaUser, FaCog, FaSignOutAlt, FaAngleDown, FaPlus, FaBell } from 'react-icons/fa';
import { useUI } from '@/context/UIContext';
import AuthModal from './AuthModal';

export default function Navbar() {
    const { data: session } = useSession();
    console.log('Navbar Session:', session?.user); // DEBUG
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toggleSidebar } = useUI();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState({ users: [], communities: [] });
    const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const searchRef = useRef(null);

    // Notifications
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const [userImage, setUserImage] = useState(session?.user?.image || null);

    const fetchNotifications = async () => {
        if (session?.user) {
            try {
                const res = await fetch('/api/notifications');
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data.notifications);
                    setUnreadCount(data.unreadCount);
                }

                // Also fetch user profile to get the image (because base64 images are stripped from session)
                const userRes = await fetch(`/api/u/${session.user.username}`); // Or session.user.name? NextAuth maps name->username in session callback
                if (userRes.ok) {
                    const userData = await userRes.json();
                    if (userData.image) {
                        setUserImage(userData.image);
                    }
                }

            } catch (e) {
                console.error(e);
            }
        }
    };

    const markNotificationsRead = async () => {
        try {
            await fetch('/api/notifications', { method: 'PATCH' });
            setUnreadCount(0);
            // Optionally update local read status of list
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        if (session?.user?.image && !session.user.image.startsWith('data:')) {
            setUserImage(session.user.image);
        }
    }, [session]);

    useEffect(() => {
        fetchNotifications();
        // Poll every minute? Or just once on mount/session change
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [session]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length >= 1) {
                fetch(`/api/search?q=${encodeURIComponent(query)}`)
                    .then(res => res.json())
                    .then(data => {
                        setSearchResults(data);
                        setIsSearchDropdownOpen(true);
                    });
            } else {
                setSearchResults({ users: [], communities: [] });
                setIsSearchDropdownOpen(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        if (searchParams.get('login') === 'true') {
            setIsAuthModalOpen(true);
            // Remove the param without refreshing
            const newUrl = window.location.pathname + window.location.search.replace(/(\?|&)login=true/, '');
            window.history.replaceState({}, '', newUrl);
        }
    }, [searchParams]);

    // Handle click outside to close dropdowns
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
            setIsSearchDropdownOpen(false);
        }
    };

    return (
        <nav className={styles.navbar}>
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button onClick={toggleSidebar} style={{ color: 'var(--color-text-main)', fontSize: '20px', display: 'flex' }} suppressHydrationWarning>
                    <FaBars />
                </button>
                <Link href="/" className={styles.logo}>
                    <div style={{ background: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '6px' }}>
                        <FaReddit size={32} style={{ minWidth: '32px' }} />
                    </div>
                    <span>reddit</span>
                </Link>
            </div>

            <div className={styles.searchWrapper} ref={searchRef}>
                <form className={styles.search} onSubmit={handleSearch}>
                    <div className={styles.searchIconWrapper}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M14.1108 12.9231C15.2891 11.4727 16 9.62312 16 7.60002C16 2.96083 12.2386 -0.799976 7.60002 -0.799976C2.96083 -0.799976 -0.799976 2.96083 -0.799976 7.60002C -0.799976 12.2386 2.96083 16 7.60002 16C9.62312 16 11.4727 15.2891 12.9231 14.1108L17.4061 18.5937C17.7341 18.9213 18.2655 18.9213 18.5937 18.5937C18.9213 18.2655 18.9213 17.7341 18.5937 17.4061L14.1108 12.9231ZM7.60002 14.32C3.88874 14.32 0.880024 11.3113 0.880024 7.60002C0.880024 3.88874 3.88874 0.880024 7.60002 0.880024C11.3113 0.880024 14.32 3.88874 14.32 7.60002C14.32 11.3113 11.3113 14.32 7.60002 14.32Z" fill="currentColor" />
                        </svg>
                    </div>
                    <input
                        suppressHydrationWarning
                        type="text"
                        placeholder="Search Reddit"
                        className={`${styles.searchInput} ${isSearchDropdownOpen && (searchResults.users.length > 0 || searchResults.communities.length > 0) ? styles.searchInputOpen : ''}`}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => {
                            if (query.length >= 1) setIsSearchDropdownOpen(true);
                        }}
                    />
                    {query && (
                        <button
                            suppressHydrationWarning
                            type="button"
                            className={styles.clearButton}
                            onClick={() => {
                                setQuery('');
                                setIsSearchDropdownOpen(false);
                                setSearchResults({ users: [], communities: [] });
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0ZM13.5355 6.46447C13.7308 6.2692 14.0474 6.2692 14.2426 6.46447C14.4379 6.65973 14.4379 6.97631 14.2426 7.17157L10.7071 10.7071L14.2426 14.2426C14.4379 14.4379 14.4379 14.7545 14.2426 14.9497C14.0474 15.145 13.7308 15.145 13.5355 14.9497L10 11.4142L6.46447 14.9497C6.2692 15.145 5.95262 15.145 5.75736 14.9497C5.5621 14.7545 5.5621 14.4379 5.75736 14.2426L9.29289 10.7071L5.75736 7.17157C5.5621 6.97631 5.5621 6.65973 5.75736 6.46447C5.95262 6.2692 6.2692 6.2692 6.46447 6.46447L10 10L13.5355 6.46447Z" fill="currentColor" />
                            </svg>
                        </button>
                    )}
                </form>
                {isSearchDropdownOpen && (searchResults.users.length > 0 || searchResults.communities.length > 0) && (
                    <div className={styles.searchDropdown}>
                        {searchResults.communities.length > 0 && (
                            <div className={styles.searchSection}>
                                <div className={styles.searchSectionTitle}>Communities</div>
                                {searchResults.communities.map((community) => (
                                    <Link
                                        key={community._id}
                                        href={`/r/${community.name}`}
                                        className={styles.searchResultItem}
                                        onClick={() => setIsSearchDropdownOpen(false)}
                                    >
                                        <div className={styles.resultIcon}>
                                            {community.icon ? (
                                                <img
                                                    src={community.icon}
                                                    alt=""
                                                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <img
                                                    src="/default-subreddit.png"
                                                    alt=""
                                                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                                />
                                            )}
                                        </div>
                                        <div className={styles.resultInfo}>
                                            <span className={styles.resultName}>r/{community.name}</span>
                                            <span className={styles.resultMeta}>{community.members?.length || 0} members</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                        {searchResults.users.length > 0 && (
                            <div className={styles.searchSection}>
                                <div className={styles.searchSectionTitle}>People</div>
                                {searchResults.users.map((user) => (
                                    <Link
                                        key={user._id}
                                        href={`/u/${user.username}`}
                                        className={styles.searchResultItem}
                                        onClick={() => setIsSearchDropdownOpen(false)}
                                    >
                                        <div className={styles.resultIcon}>
                                            {user.image ? (
                                                <img
                                                    src={user.image}
                                                    alt=""
                                                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <FaUser />
                                            )}
                                        </div>
                                        <div className={styles.resultInfo}>
                                            <span className={styles.resultName}>u/{user.username}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className={styles.actions}>
                {session ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Link href="/submit" className={styles.createButton}>
                            <FaPlus />
                            <span>Create</span>
                        </Link>

                        <div className={styles.iconButtonWrapper} style={{ position: 'relative' }}>
                            <button
                                className={styles.iconButton}
                                onClick={() => {
                                    setIsNotifOpen(!isNotifOpen);
                                    if (!isNotifOpen && unreadCount > 0) {
                                        markNotificationsRead();
                                    }
                                }}
                            >
                                <FaBell />
                                {unreadCount > 0 && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '-2px',
                                        right: '-2px',
                                        background: '#FF4500',
                                        color: 'white',
                                        fontSize: '10px',
                                        fontWeight: 'bold',
                                        borderRadius: '50%',
                                        width: '16px',
                                        height: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '2px solid var(--color-surface)'
                                    }}>
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {isNotifOpen && (
                                <div style={{
                                    position: 'absolute',
                                    right: 0,
                                    top: '100%',
                                    marginTop: '8px',
                                    width: '320px',
                                    maxHeight: '400px',
                                    overflowY: 'auto',
                                    background: 'var(--color-surface)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '4px',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                                    zIndex: 100
                                }}>
                                    <div style={{ padding: '12px', borderBottom: '1px solid var(--color-border)', fontWeight: 'bold' }}>
                                        Notifications
                                    </div>
                                    {notifications.length === 0 ? (
                                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-dim)' }}>
                                            No notifications
                                        </div>
                                    ) : (
                                        notifications.map(notif => (
                                            <Link
                                                key={notif._id}
                                                href={`/r/${notif.post?.community || 'all'}/comments/${notif.post?._id}`}
                                                style={{
                                                    display: 'flex',
                                                    gap: '10px',
                                                    padding: '12px',
                                                    textDecoration: 'none',
                                                    color: 'inherit',
                                                    borderBottom: '1px solid var(--color-border)',
                                                    background: notif.read ? 'transparent' : 'rgba(36, 160, 237, 0.1)'
                                                }}
                                                onClick={() => setIsNotifOpen(false)}
                                            >
                                                <div style={{ flexShrink: 0 }}>
                                                    <img
                                                        src={notif.sender?.image || '/default-subreddit.png'}
                                                        alt="avatar"
                                                        style={{ width: 32, height: 32, borderRadius: '50%' }}
                                                    />
                                                </div>
                                                <div style={{ fontSize: '13px' }}>
                                                    <span style={{ fontWeight: 'bold' }}>u/{notif.sender?.username}</span>
                                                    {' '}
                                                    <span style={{ color: 'var(--color-text-dim)' }}>
                                                        {(() => {
                                                            switch (notif.type) {
                                                                case 'post_reply': return 'commented on your post';
                                                                case 'comment_reply': return 'replied to your comment';
                                                                case 'post_upvote': return 'upvoted your post';
                                                                case 'post_downvote': return 'downvoted your post';
                                                                case 'comment_upvote': return 'upvoted your comment';
                                                                case 'comment_downvote': return 'downvoted your comment';
                                                                default: return 'notification';
                                                            }
                                                        })()}
                                                    </span>
                                                    {' '}
                                                    <span style={{ color: 'var(--color-text-main)' }}>
                                                        {notif.post?.title?.substring(0, 30)}...
                                                    </span>
                                                    <div style={{ fontSize: '11px', color: 'var(--color-text-dim)', marginTop: '4px' }}>
                                                        {new Date(notif.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </Link>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        <div className={styles.dropdownWrapper} ref={dropdownRef}>
                            <button
                                className={`${styles.profileButton} ${isDropdownOpen ? styles.active : ''}`}
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <img
                                    src={userImage || '/default-subreddit.png'}
                                    alt="avatar"
                                    style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                                />
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1 }}>
                                    <span style={{ fontWeight: '500', fontSize: '13px' }}>{session.user.username}</span>
                                </div>
                                <FaAngleDown size={12} color="var(--color-text-secondary)" />
                            </button>

                            {isDropdownOpen && (
                                <div className={styles.dropdown}>
                                    <div className={styles.dropdownHeader}>
                                        <span className={styles.userName}>{session.user.username}</span>
                                        <span className={styles.userHandle}>u/{session.user.username}</span>
                                    </div>
                                    <ul className={styles.dropdownList}>
                                        <li>
                                            <Link
                                                href={`/u/${session.user.username}`}
                                                className={styles.dropdownItem}
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                <span className={styles.dropdownIcon}><FaUser /></span>
                                                View Profile
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                href="/settings"
                                                className={styles.dropdownItem}
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                <span className={styles.dropdownIcon}><FaCog /></span>
                                                Settings
                                            </Link>
                                        </li>
                                        <div style={{ height: 1, backgroundColor: 'var(--color-border)', margin: '8px 0' }}></div>
                                        <li>
                                            <button
                                                onClick={() => signOut()}
                                                className={styles.dropdownItem}
                                            >
                                                <span className={styles.dropdownIcon}><FaSignOutAlt /></span>
                                                Log Out
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        <button onClick={() => setIsAuthModalOpen(true)} className="btn btn-primary" suppressHydrationWarning>Log In</button>
                    </>
                )}
            </div>
        </nav>
    );
}
