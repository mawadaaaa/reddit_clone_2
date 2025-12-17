'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import styles from './Navbar.module.css';
import { FaReddit, FaBars } from 'react-icons/fa';
import { useUI } from '@/context/UIContext';
import AuthModal from './AuthModal';

export default function Navbar() {
    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toggleSidebar } = useUI();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [query, setQuery] = useState('');

    useEffect(() => {
        if (searchParams.get('login') === 'true') {
            setIsAuthModalOpen(true);
            // Remove the param without refreshing
            const newUrl = window.location.pathname + window.location.search.replace(/(\?|&)login=true/, '');
            window.history.replaceState({}, '', newUrl);
        }
    }, [searchParams]);

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
                <button onClick={toggleSidebar} style={{ color: 'var(--color-text-main)', fontSize: '20px', display: 'flex' }}>
                    <FaBars />
                </button>
                <Link href="/" className={styles.logo}>
                    <FaReddit size={32} />
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
                    <div className={styles.userMenu}>
                        <span>{session.user.username}</span>
                        <button
                            onClick={() => signOut()}
                            className="btn btn-outline"
                        >
                            Log Out
                        </button>
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
