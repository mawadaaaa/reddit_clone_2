'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './CommunityHeader.module.css';

export default function CommunityHeader({ community }) {
    const { data: session } = useSession();
    const router = useRouter();

    const isMember = session && community.members.includes(session.user.id);
    const [joined, setJoined] = useState(isMember);
    const [loading, setLoading] = useState(false);

    const handleJoin = async () => {
        if (!session) {
            router.push('/?login=true');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/communities/${community.name}/join`, {
                method: 'POST',
            });

            if (res.ok) {
                const data = await res.json();
                setJoined(data.isMember);
                router.refresh();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Use schema themeColor or fallback
    const themeColor = community.themeColor || '#0079D3';

    return (
        <div>
            {/* Banner Area */}
            <div
                className={styles.banner}
                style={{
                    backgroundColor: themeColor,
                    backgroundImage: community.banner ? `url(${community.banner})` : 'none'
                }}
            ></div>

            <div className={styles.container}>
                <div className={styles.contentWrapper}>
                    {/* Icon */}
                    <div className={styles.iconWrapper}>
                        {community.icon ? (
                            <img src={community.icon} alt={community.name} className={styles.icon} />
                        ) : (
                            <div className={styles.icon} style={{ backgroundColor: themeColor }}>
                                r/
                            </div>
                        )}
                    </div>

                    <div className={styles.headerContent}>
                        <div className={styles.titleSection}>
                            <h1 className={styles.title}>
                                {community.title || community.name}
                            </h1>
                            <span className={styles.subTitle}>r/{community.name}</span>
                        </div>

                        <div className={styles.actions}>
                            <Link href={`/r/${community.name}/submit`}>
                                <button className="btn btn-outline" style={{ borderRadius: '999px', fontWeight: 'bold' }}>Create Post</button>
                            </Link>
                            <button className={styles.iconBtn}>
                                <svg fill="currentColor" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path>
                                </svg>
                            </button>
                            <button
                                onClick={handleJoin}
                                disabled={loading}
                                className={`btn ${joined ? 'btn-outline' : 'btn-primary'} ${styles.joinBtn}`}
                            >
                                {loading ? '...' : (joined ? 'Joined' : 'Join')}
                            </button>
                            <button className={styles.iconBtn}>
                                <svg fill="currentColor" height="16" viewBox="0 0 20 20" width="16" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
