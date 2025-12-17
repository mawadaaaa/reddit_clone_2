'use client';

import Link from 'next/link';
import { FaArrowUp, FaArrowDown, FaCommentAlt } from 'react-icons/fa';
import AISummary from './AISummary';
import styles from './PostCard.module.css';
import AuthModal from './AuthModal';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PostCard({ post, communityName, enableAI = false }) {
    const { data: session } = useSession();
    const router = useRouter();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    // Initial state from props
    const [score, setScore] = useState((post.upvotes?.length || 0) - (post.downvotes?.length || 0));
    const [userVote, setUserVote] = useState(() => {
        if (!session) return null;
        if (post.upvotes?.includes(session.user.id)) return 'up';
        if (post.downvotes?.includes(session.user.id)) return 'down';
        return null;
    });

    const handleVote = async (type) => {
        if (!session) {
            setIsAuthModalOpen(true);
            return;
        }

        // Optimistic update
        const previousScore = score;
        const previousVote = userVote;

        // Calculate new state logic (simple toggle awareness)
        let newVote = type;
        if (userVote === type) newVote = null; // Toggle off

        let newScore = score;
        if (userVote === 'up') newScore--;
        if (userVote === 'down') newScore++;
        if (newVote === 'up') newScore++;
        if (newVote === 'down') newScore--;

        setScore(newScore);
        setUserVote(newVote);

        try {
            const res = await fetch(`/api/posts/${post._id}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type }), // API handles toggle logic based on current DB state, but we send 'up' or 'down'
            });

            if (!res.ok) {
                // Revert on error
                setScore(previousScore);
                setUserVote(previousVote);
            } else {
                const data = await res.json();
                // Sync with server source of truth
                setScore(data.score);
            }
        } catch (error) {
            setScore(previousScore);
            setUserVote(previousVote);
        }
    };

    return (
        <div className={styles.card}>
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
            <div className={styles.votes}>
                <button
                    className={styles.voteBtn}
                    style={{ color: userVote === 'up' ? '#FF4500' : undefined }}
                    onClick={(e) => { e.preventDefault(); handleVote('up'); }}
                >
                    <FaArrowUp />
                </button>
                <span className={styles.voteCount} style={{ color: userVote === 'up' ? '#FF4500' : userVote === 'down' ? '#7193FF' : undefined }}>
                    {score}
                </span>
                <button
                    className={styles.voteBtn}
                    style={{ color: userVote === 'down' ? '#7193FF' : undefined }}
                    onClick={(e) => { e.preventDefault(); handleVote('down'); }}
                >
                    <FaArrowDown />
                </button>
            </div>
            <div className={styles.content}>
                <div className={styles.header}>
                    {communityName && (
                        <Link href={`/r/${communityName}`} className={styles.subreddit}>
                            r/{communityName}
                        </Link>
                    )}
                    <span className={styles.meta}>
                        Posted by u/{post.author?.username || 'deleted'} • {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                </div>
                <Link href={`/r/${communityName || post.community?.name}/comments/${post._id}`} className={styles.titleLink}>
                    <h3 className={styles.title}>{post.title}</h3>
                </Link>

                {post.image && (
                    <div className={styles.imageContainer} style={{ margin: '10px 0' }}>
                        <img
                            src={post.image}
                            alt={post.title}
                            style={{ maxWidth: '100%', maxHeight: '500px', borderRadius: '4px', display: 'block' }}
                        />
                    </div>
                )}

                <div className={styles.body}>
                    {post.content.length > 200 && !enableAI ? post.content.substring(0, 200) + '...' : post.content}
                </div>

                {enableAI && <AISummary content={post.content} />}

                <div className={styles.footer}>
                    <Link href={`/r/${communityName || post.community?.name}/comments/${post._id}`} className={styles.action}>
                        <FaCommentAlt /> Comments
                    </Link>
                </div>
            </div>
        </div>
    );
}
