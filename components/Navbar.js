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
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toggleSidebar } = useUI();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (searchParams.get('login') === 'true') {
            setIsAuthModalOpen(true);
            // Remove the param without refreshing
            const newUrl = window.location.pathname + window.location.search.replace(/(\?|&)login=true/, '');
            window.history.replaceState({}, '', newUrl);
        }
    }, [searchParams]);

    // Handle click outside to close dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
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

            <form className={styles.search} onSubmit={handleSearch}>
                <input
                    type="text"
                    placeholder="Search Reddit"
                    className={styles.searchInput}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </form>

            <div className={styles.actions}>
                {session ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Link href="/submit" className={styles.createButton}>
                            <FaPlus />
                            <span>Create</span>
                        </Link>

                        <button className={styles.iconButton}>
                            <FaBell />
                        </button>

                        <div className={styles.dropdownWrapper} ref={dropdownRef}>
                            <button
                                className={`${styles.profileButton} ${isDropdownOpen ? styles.active : ''}`}
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <img
                                    src={`https://api.dicebear.com/7.x/identicon/svg?seed=${session.user.username}`}
                                    alt="avatar"
                                    style={{ width: 32, height: 32, borderRadius: '50%' }}
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
                        <button onClick={() => setIsAuthModalOpen(true)} className="btn btn-primary">Log In</button>
                    </>
                )}
            </div>
        </nav>
    );
}
