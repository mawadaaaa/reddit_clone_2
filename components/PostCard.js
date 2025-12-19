'use client';

import Link from 'next/link';
import { FaArrowUp, FaArrowDown, FaCommentAlt, FaEllipsisH, FaEdit, FaBookmark, FaEyeSlash, FaTrash, FaLink, FaExternalLinkAlt } from 'react-icons/fa';
import AISummary from './AISummary';
import styles from './PostCard.module.css';
import AuthModal from './AuthModal';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { useVote } from '@/context/VoteContext';

export default function PostCard({ post, communityName, enableAI = false }) {
    const { data: session } = useSession();
    const router = useRouter();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    // Context for global vote state (solving stale back-navigation)
    const { getVote, registerVote } = useVote();
    const globalVote = getVote(post._id);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Initial state from props
    // We default to props, but if global state exists (fresh navigation), we might update in effect
    const [score, setScore] = useState((post.upvotes?.length || 0) - (post.downvotes?.length || 0));
    const [userVote, setUserVote] = useState(() => {
        if (!session) return null;

        console.log('PostCard vote check:', {
            postId: post._id,
            userId: session.user.id,
            upvotes: post.upvotes,
            hasUpvoted: post.upvotes?.includes(session.user.id),
            hasUpvotedLoose: post.upvotes?.some(id => id.toString() === session.user.id)
        });

        // Use more robust check
        if (post.upvotes?.some(id => id.toString() === session.user.id)) return 'up';
        if (post.downvotes?.some(id => id.toString() === session.user.id)) return 'down';
        return null;
    });

    // 1. Sync GLOBAL state -> LOCAL state
    // If we have a global record (e.g. came back from single post view), use it.
    useEffect(() => {
        if (globalVote) {
            setScore(globalVote.score);
            setUserVote(globalVote.userVote);
        }
    }, [globalVote]);

    // 2. Sync PROPS -> LOCAL state (only if no global state overrides, e.g. first load)
    useEffect(() => {
        // Only reset from props if we DON'T have a global override active
        // Or if the session just loaded and global state is empty
        if (session?.user?.id && !globalVote) {
            let vote = null;
            if (post.upvotes?.some(id => id.toString() === session.user.id)) vote = 'up';
            else if (post.downvotes?.some(id => id.toString() === session.user.id)) vote = 'down';

            setUserVote(vote);
            // Note: We don't reset score from props here to avoid jumping if global state had it different? 
            // Actually props are usually static until refresh.
        }
    }, [session, post.upvotes, post.downvotes, globalVote]);

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

        // Update GLOBAL state immediately
        registerVote(post._id, newVote, newScore);

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
                registerVote(post._id, previousVote, previousScore);
            } else {
                const data = await res.json();
                // Sync with server source of truth
                setScore(data.score);
                // Update global again with confirmed server data
                registerVote(post._id, newVote, data.score);
            }
        } catch (error) {
            setScore(previousScore);
            setUserVote(previousVote);
            registerVote(post._id, previousVote, previousScore);
        }
    };

    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        const checkSaveStatus = async () => {
            if (session?.user) {
                try {
                    const res = await fetch(`/api/posts/${post._id}/save`);
                    if (res.ok) {
                        const data = await res.json();
                        setIsSaved(data.saved);
                    }
                } catch (error) {
                    console.error('Failed to check save status');
                }
            }
        };
        checkSaveStatus();
    }, [post._id, session]);

    const handleSave = async () => {
        if (!session) {
            setIsAuthModalOpen(true);
            return;
        }

        const previousState = isSaved;
        setIsSaved(!isSaved); // Optimistic

        try {
            const res = await fetch(`/api/posts/${post._id}/save`, {
                method: 'POST',
            });

            if (!res.ok) {
                setIsSaved(previousState);
                alert('Failed to save post');
            } else {
                const data = await res.json();
                setIsSaved(!data.saved); // API returns 'saved' as boolean of (unsaved -> false, saved -> true)? No...
                // API returns { saved: boolean } representing the NEW state
                setIsSaved(data.saved);
            }
        } catch (error) {
            setIsSaved(previousState);
            console.error(error);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        try {
            const res = await fetch(`/api/posts/${post._id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                // Refresh page or remove from UI
                window.location.reload();
            } else {
                alert('Failed to delete post');
            }
        } catch (error) {
            console.error(error);
            alert('Error deleting post');
        }
    };

    const [isHidden, setIsHidden] = useState(false);

    useEffect(() => {
        const checkHideStatus = async () => {
            if (session?.user) {
                try {
                    const res = await fetch(`/api/posts/${post._id}/hide`);
                    if (res.ok) {
                        const data = await res.json();
                        setIsHidden(data.hidden);
                    }
                } catch (error) {
                    console.error('Failed to check hide status');
                }
            }
        };
        checkHideStatus();
    }, [post._id, session]);

    const handleHide = async () => {
        if (!session) {
            setIsAuthModalOpen(true);
            return;
        }

        const previousState = isHidden;
        setIsHidden(!isHidden);

        try {
            const res = await fetch(`/api/posts/${post._id}/hide`, {
                method: 'POST',
            });

            if (!res.ok) {
                setIsHidden(previousState);
                alert('Failed to hide post');
            } else {
                const data = await res.json();
                setIsHidden(data.hidden);
            }
        } catch (error) {
            setIsHidden(previousState);
            console.error(error);
        }
    };

    const isOwner = session?.user?.name === post.author?.username;

    return (
        <div className={styles.card}>
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

            <div className={styles.content}>
                {/* Header */}
                <div className={styles.header} style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                        {communityName && (
                            <Link href={`/r/${communityName}`} className={styles.subreddit}>
                                <img
                                    src={`https://api.dicebear.com/7.x/identicon/svg?seed=${communityName}`}
                                    alt="icon"
                                    style={{ width: 20, height: 20, borderRadius: '50%' }}
                                />
                                r/{communityName}
                            </Link>
                        )}
                        <span className={styles.meta}>
                            • Posted by u/{post.author?.username || 'deleted'} • {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                    </div>

                    <div ref={menuRef}>
                        <button
                            suppressHydrationWarning
                            onClick={(e) => { e.preventDefault(); setShowMenu(!showMenu); }}
                            style={{ background: 'transparent', border: 'none', color: 'var(--color-text-dim)', cursor: 'pointer', padding: '4px' }}
                        >
                            <FaEllipsisH />
                        </button>
                        {showMenu && (
                            <div style={{
                                position: 'absolute',
                                right: 0,
                                top: '100%',
                                background: '#1A1A1B', // Dark background like screenshot
                                border: '1px solid #343536',
                                borderRadius: '4px',
                                zIndex: 10,
                                minWidth: '200px',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
                            }}>
                                {isOwner && (
                                    <>
                                        <button className={styles.menuItem} onClick={(e) => { e.preventDefault(); alert('Edit clicked'); setShowMenu(false); }}>
                                            <FaEdit style={{ marginRight: '10px' }} /> Edit post body
                                        </button>
                                        <button className={styles.menuItem} onClick={(e) => { e.preventDefault(); handleDelete(); }} style={{ color: '#FF4500' }}>
                                            <FaTrash style={{ marginRight: '10px' }} /> Delete
                                        </button>
                                    </>
                                )}
                                <button className={styles.menuItem} onClick={(e) => { e.preventDefault(); handleSave(); setShowMenu(false); }}>
                                    <FaBookmark style={{ marginRight: '10px', color: isSaved ? '#4fbcff' : 'inherit' }} /> {isSaved ? 'Unsave' : 'Save'}
                                </button>
                                <button className={styles.menuItem} onClick={(e) => { e.preventDefault(); handleHide(); setShowMenu(false); }}>
                                    <FaEyeSlash style={{ marginRight: '10px' }} /> {isHidden ? 'Unhide' : 'Hide'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Title */}
                <Link href={`/r/${communityName || post.community?.name}/comments/${post._id}`} className={styles.titleLink}>
                    <h3 className={styles.title}>{post.title}</h3>
                </Link>

                {/* Flair (Simulated) */}
                {communityName === 'EldenRingHelp' && (
                    <div className={styles.flair}>Elden Ring - Need Help</div>
                )}

                {/* Media Rendering */}
                {post.video ? (
                    <div className={styles.mediaContainer}>
                        <video controls className={styles.mediaVideo} suppressHydrationWarning>
                            <source src={post.video} type="video/mp4" suppressHydrationWarning />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                ) : post.image ? (
                    <div className={styles.mediaContainer}>
                        <img
                            src={post.image}
                            alt={post.title}
                            className={styles.mediaImage}
                        />
                    </div>
                ) : post.link ? (
                    <div className={styles.mediaContainer}>
                        <a
                            href={post.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 16px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '4px',
                                textDecoration: 'none',
                                color: 'var(--color-text-main)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                                <div style={{ background: 'var(--color-border)', padding: '8px', borderRadius: '4px', display: 'flex' }}>
                                    <FaLink />
                                </div>
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '14px' }}>
                                    {post.link.length > 50 ? post.link.substring(0, 50) + '...' : post.link}
                                </span>
                            </div>
                            <FaExternalLinkAlt style={{ fontSize: '12px', color: 'var(--color-text-dim)' }} />
                        </a>
                    </div>
                ) : null}

                {/* Body Text */}
                <div className={styles.body}>
                    {post.content.length > 200 && !enableAI ? post.content.substring(0, 200) + '...' : post.content}
                </div>

                {enableAI && <AISummary content={post.content} />}

                {/* Footer Actions (Vote Pill + Comment Pill + Share Pill) */}
                <div className={styles.footer}>
                    {/* Vote Pill */}
                    <div className={`${styles.pill} ${styles.votePill}`}>
                        <button
                            suppressHydrationWarning
                            className={`${styles.voteBtn} ${userVote === 'up' ? styles.upvote : ''}`}
                            onClick={(e) => { e.preventDefault(); handleVote('up'); }}
                            title="Upvote"
                        >
                            <FaArrowUp />
                        </button>
                        <span className={styles.voteCount} style={{ color: userVote === 'up' ? '#FF4500' : userVote === 'down' ? '#7193FF' : undefined }}>
                            {score}
                        </span>
                        <button
                            suppressHydrationWarning
                            className={`${styles.voteBtn} ${userVote === 'down' ? styles.downvote : ''}`}
                            onClick={(e) => { e.preventDefault(); handleVote('down'); }}
                            title="Downvote"
                        >
                            <FaArrowDown />
                        </button>
                    </div>

                    {/* Comments Pill */}
                    <Link href={`/r/${communityName || post.community?.name}/comments/${post._id}`} className={`${styles.pill} ${styles.actionPill}`}>
                        <FaCommentAlt className={styles.actionIcon} />
                        <span>{post.commentCount !== undefined ? post.commentCount : (post.comments?.length || 0)}</span>
                    </Link>

                    {/* Share Pill */}
                    <button className={`${styles.pill} ${styles.actionPill}`} suppressHydrationWarning onClick={(e) => { e.preventDefault(); alert('Share clicked'); }}>
                        <svg className={styles.actionIcon} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L12 22M12 2L2 12M12 2L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        </svg>
                        <span>Share</span>
                    </button>

                    {/* Save Pill */}
                    <button className={`${styles.pill} ${styles.actionPill}`} suppressHydrationWarning onClick={(e) => { e.preventDefault(); handleSave(); }}>
                        {isSaved ? (
                            <FaBookmark className={styles.actionIcon} style={{ color: '#4fbcff' }} />
                        ) : (
                            <svg className={styles.actionIcon} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                <polyline points="7 3 7 8 15 8"></polyline>
                            </svg>
                        )}
                        <span>{isSaved ? 'Unsave' : 'Save'}</span>
                    </button>
                </div>
            </div>
        </div >
    );
}
