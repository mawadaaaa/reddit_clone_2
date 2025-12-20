'use client';

import Link from 'next/link';
import { FaPlay } from 'react-icons/fa';
import styles from './BestPostCard.module.css';

export default function BestPostCard({ post }) {
    const communityName = post.community?.name || 'reddit';

    // Determine thumbnail
    let thumbnail = null;
    let isVideo = false;

    if (post.image) {
        thumbnail = post.image;
    } else if (post.video) {
        // For video we might not have a poster, but we can try to show the video itself as a thumbnail or a placeholder
        thumbnail = post.video;
        isVideo = true;
    }

    return (
        <div className={styles.card}>
            <div className={styles.content}>
                <div className={styles.header}>
                    <Link href={`/r/${communityName}`} className={styles.subreddit}>
                        {post.community?.icon ? (
                            <img src={post.community.icon} alt="icon" className={styles.subredditIcon} />
                        ) : (
                            <img src="/default-subreddit.png" alt="icon" className={styles.subredditIcon} />
                        )}
                        r/{communityName}
                    </Link>
                </div>

                <Link href={`/r/${communityName}/comments/${post._id}`} className={styles.titleLink}>
                    <h3 className={styles.title}>{post.title}</h3>
                </Link>

                <div className={styles.meta}>
                    {post.upvoteCount || post.upvotes?.length || 0} upvotes · {post.commentCount || post.comments?.length || 0} comments
                </div>
            </div>

            {thumbnail && (
                <Link href={`/r/${communityName}/comments/${post._id}`} className={styles.mediaThumbnail}>
                    {isVideo ? (
                        <>
                            <video src={thumbnail} muted />
                            <div className={styles.videoBadge}>
                                <FaPlay size={8} /> 0:13
                            </div>
                        </>
                    ) : (
                        <img src={thumbnail} alt={post.title} />
                    )}
                </Link>
            )}
        </div>
    );
}
