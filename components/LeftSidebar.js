'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef, useState } from 'react';
import { FaHome, FaChartLine, FaCompass, FaBook, FaReddit, FaBalanceScale, FaUniversalAccess, FaChevronDown, FaChevronUp, FaCog, FaStar, FaRegStar, FaPlus } from 'react-icons/fa';
import styles from './LeftSidebar.module.css';
import { useUI } from '@/context/UIContext';

export default function LeftSidebar() {
    const pathname = usePathname();
    const { isSidebarOpen } = useUI();
    const [isCommunitiesOpen, setIsCommunitiesOpen] = useState(true);

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
                        {communities.map((community, idx) => (
                            <Link key={idx} href={`/${community.name}`} className={styles.dropdownItem}>
                                <div className={styles.communityIconWrapper}>
                                    {/* Placeholder for community icon */}
                                    {community.icon ? <img src={community.icon} alt="" /> : <FaReddit size={20} />}
                                </div>
                                <span className={styles.communityName}>{community.name}</span>
                                <FaRegStar className={styles.starIcon} size={14} />
                            </Link>
                        ))}
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
