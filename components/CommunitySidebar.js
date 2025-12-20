'use client';

import { FaBirthdayCake, FaUserFriends, FaCircle } from 'react-icons/fa';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import styles from './CommunitySidebar.module.css';

export default function CommunitySidebar({ community }) {
    const { data: session } = useSession();
    const isMember = session && community.members.includes(session.user.id);

    // Basic date formatting
    const createdAt = new Date(community.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                About Community
            </div>
            <div className={styles.padding}>
                <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2 className={styles.title}>{community.title || `r/${community.name}`}</h2>
                </div>

                <p className={styles.description}>
                    {community.description || `r/${community.name} is a subreddit for...`}
                </p>

                <div className={styles.metadataRow}>
                    <FaBirthdayCake />
                    <span>Created {createdAt}</span>
                </div>

                <div className={styles.metadataRow}>
                    <FaUserFriends />
                    <span>Public</span>
                </div>


                <div className={styles.statsGrid}>
                    <div className={styles.statItem}>
                        <div className={styles.statValue}>{community.members.length.toLocaleString()}</div>
                        <div className={styles.statLabel}>Members</div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statValue} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FaCircle size={8} color="#46D160" />
                            {Math.ceil(community.members.length * 0.12)}
                        </div>
                        <div className={styles.statLabel}>Online</div>
                    </div>
                </div>


            </div>


        </div>
    );
}
