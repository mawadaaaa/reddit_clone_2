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

    // Deterministic color based on name
    const bgColors = ['#0079D3', '#FF4500', '#46D160', '#FFB000'];
    const colorIndex = community.name.length % bgColors.length;
    const themeColor = bgColors[colorIndex];

    return (
        <div>
            {/* Banner Area */}
            <div className={styles.banner} style={{ backgroundColor: themeColor }}></div>

            <div className={styles.container}>
                <div className={styles.contentWrapper}>
                    {/* Icon */}
                    <div className={styles.iconWrapper}>
                        {community.image ? (
                            <img src={community.image} alt={community.name} className={styles.icon} />
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
                                {/* Verified badge placeholder logic if we had it */}
                                {/* <FaCheckCircle color="#24A0ED" size={16} /> */}
                            </h1>
                            <span className={styles.subTitle}>r/{community.name}</span>
                        </div>

                        <div className={styles.actions}>
                            <Link href={`/r/${community.name}/submit`}>
                                <button className="btn btn-outline" style={{ borderRadius: '20px', fontWeight: 'bold' }}>Create Post</button>
                            </Link>
                            <button
                                onClick={handleJoin}
                                disabled={loading}
                                className={`btn ${joined ? 'btn-outline' : 'btn-primary'} ${styles.joinBtn}`}
                            >
                                {loading ? '...' : (joined ? 'Joined' : 'Join')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
