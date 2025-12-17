'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaChartLine, FaCompass, FaBook, FaReddit, FaBalanceScale, FaUniversalAccess } from 'react-icons/fa';
import styles from './LeftSidebar.module.css';
import { useUI } from '@/context/UIContext';

export default function LeftSidebar() {
    const pathname = usePathname();
    const { isSidebarOpen } = useUI();

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
                <h3 className={styles.title}>POPULAR COMMUNITIES</h3>
                <Link href="/r/askreddit" className={styles.link}>
                    <FaReddit size={20} />
                    r/AskReddit
                </Link>
                <Link href="/r/no" className={styles.link}>
                    <FaReddit size={20} />
                    r/no
                </Link>
            </div>

            <div className={styles.separator} />

            <div className={styles.section}>
                <Link href="/communities" className={styles.link}>
                    <FaReddit size={20} />
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
