'use client';

import Link from 'next/link';
import styles from './ExploreCard.module.css';

export default function ExploreCard({ community }) {
    // Mock visitors count logic
    const visitors = (community.members?.length || 0) * 15 + Math.floor(Math.random() * 500);

    const formatCount = (n) => {
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
        return n;
    };

    return (
        <Link href={`/r/${community.name}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <img
                        src={community.icon || '/default-subreddit.png'}
                        alt=""
                        className={styles.icon}
                    />
                    <div className={styles.info}>
                        <div className={styles.name}>r/{community.name}</div>
                        <div className={styles.subtext}>{formatCount(visitors)} weekly visitors</div>
                    </div>
                    <button className={styles.joinBtn} onClick={(e) => {
                        e.preventDefault();
                        alert(`Joined r/${community.name}`);
                    }}>
                        Join
                    </button>
                </div>
                <div className={styles.description}>
                    {community.description || `Welcome to r/${community.name}, the best place to discuss everything related to this topic.`}
                </div>
            </div>
        </Link>
    );
}
