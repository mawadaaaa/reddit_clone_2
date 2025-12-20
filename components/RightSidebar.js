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
                                {community.icon ? (
                                    <img src={community.icon} alt={community.name} style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} />
                                ) : (
                                    <img src="/default-subreddit.png" alt={community.name} style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} />
                                )}
                            </div>
                            <div className={styles.info}>
                                <Link href={`/r/${community.name}`} className={styles.name}>
                                    r/{community.name}
                                </Link>
                                <span className={styles.members}>
                                    {(community.members?.length || 0).toLocaleString()} members
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
