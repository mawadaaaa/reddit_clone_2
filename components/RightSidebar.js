'use client';

import Link from 'next/link';
import { FaReddit } from 'react-icons/fa';
import styles from './RightSidebar.module.css';

export default function RightSidebar({ communities, title = "POPULAR COMMUNITIES" }) {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.widget}>
                <div className={styles.widgetHeader}>
                    <h2>{title}</h2>
                </div>
                <ul className={styles.list}>
                    {communities.map((community, idx) => (
                        <li key={community._id} className={styles.item}>
                            <div className={styles.iconWrapper}>
                                {/* Placeholder icon logic if no image */}
                                <FaReddit size={20} />
                            </div>
                            <div className={styles.info}>
                                <Link href={`/r/${community.name}`} className={styles.name}>
                                    r/{community.name}
                                </Link>
                                <span className={styles.members}>
                                    {/* Mock member count based on ID hash for stability */}
                                    {(community._id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) * 123456 % 10000000).toLocaleString()} members
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
                <div className={styles.footer}>
                    <Link href="/communities" className={styles.seeMore}>See more</Link>
                </div>
            </div>
        </aside >
    );
}
