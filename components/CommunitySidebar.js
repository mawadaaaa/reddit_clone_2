import { FaBirthdayCake, FaUserFriends, FaCircle } from 'react-icons/fa';
import Link from 'next/link';
import styles from './CommunitySidebar.module.css';

export default function CommunitySidebar({ community }) {
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

                <Link href="/submit" style={{ textDecoration: 'none' }}>
                    <button className={styles.createPostBtn}>
                        Create Post
                    </button>
                </Link>
            </div>

            {/* Bookmarks Section (Mock) */}
            <div className={styles.padding} style={{ borderTop: '1px solid var(--color-border)' }}>
                <h3 className={styles.sectionTitle}>
                    Community Bookmarks
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn" style={{ backgroundColor: '#272729', borderRadius: '20px', fontSize: '12px', padding: '8px 16px', fontWeight: '600' }}>
                        Discord server
                    </button>
                </div>
            </div>

            {/* Rules Section (Mock or real if added to model) */}
            <div className={styles.padding} style={{ borderTop: '1px solid var(--color-border)' }}>
                <h3 className={styles.sectionTitle}>
                    r/{community.name} Rules
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {community.rules && community.rules.length > 0 ? community.rules.map((rule, idx) => (
                        <div key={idx} style={{ padding: '8px 0', borderBottom: '1px solid var(--color-border)', fontSize: '14px', fontWeight: '500' }}>
                            {idx + 1}. {rule.title}
                        </div>
                    )) : (
                        <div style={{ fontSize: '14px', color: 'var(--color-text-dim)' }}>
                            1. No dooxing
                            <br />
                            2. No brigading or inciting harassment
                            <br />
                            3. Be civil
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
