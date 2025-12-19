'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import styles from './CommentsSection.module.css';
import AuthModal from './AuthModal';
import { FaArrowUp, FaArrowDown, FaCommentAlt, FaReply } from 'react-icons/fa';

// Recursive Comment Item Component
function CommentItem({ comment, depth = 0, onReply, session, isModalOpen, setIsModalOpen }) {
    const [collapsed, setCollapsed] = useState(false);
    const [isReplying, setIsReplying] = useState(false);

    // Initial state
    const [score, setScore] = useState((comment.upvotes?.length || 0) - (comment.downvotes?.length || 0));
    const [userVote, setUserVote] = useState(() => {
        if (!session) return null;
        if (comment.upvotes?.includes(session.user.id)) return 'up';
        if (comment.downvotes?.includes(session.user.id)) return 'down';
        return null;
    });

    const handleReplyClick = () => {
        if (!session) {
            setIsModalOpen(true);
        } else {
            setIsReplying(!isReplying);
        }
    };

    const handleVote = async (type) => {
        if (!session) {
            setIsModalOpen(true);
            return;
        }

        // Optimistic update
        const previousScore = score;
        const previousVote = userVote;

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
            const res = await fetch(`/api/comments/${comment._id}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type }),
            });

            if (!res.ok) {
                // Revert
                setScore(previousScore);
                setUserVote(previousVote);
            } else {
                const data = await res.json();
                setScore(data.score);
            }
        } catch (error) {
            setScore(previousScore);
            setUserVote(previousVote);
        }
    };

    if (collapsed) {
        return (
            <div className={styles.commentContainer} style={{ marginLeft: depth > 0 ? 0 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <button onClick={() => setCollapsed(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-dim)' }}>
                        [+]
                    </button>
                    <span className={styles.author} style={{ fontSize: '12px' }}>{comment.author?.username || 'deleted'}</span>
                    <span className={styles.meta} style={{ fontSize: '12px' }}>{new Date(comment.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.commentContainer}>
            <div className={styles.commentWrapper}>
                {/* Header */}
                <div className={styles.header}>
                    <img
                        src={`https://api.dicebear.com/7.x/identicon/svg?seed=${comment.author?.username || 'default'}`}
                        alt="avatar"
                        className={styles.avatar}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className={styles.author}>{comment.author?.username || 'deleted'}</span>
                            <span className={styles.meta}>• {new Date(comment.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                <div
                    className={styles.threadLine}
                    onClick={() => setCollapsed(true)}
                    title="Collapse thread"
                />

                {/* Content */}
                <div className={styles.body}>
                    {comment.content}
                </div>

                {/* Actions */}
                <div className={styles.actions}>
                    <div className={styles.voteGroup}>
                        <button
                            className={styles.actionBtn}
                            onClick={() => handleVote('up')}
                            style={{ color: userVote === 'up' ? '#FF4500' : 'inherit' }}
                        >
                            <FaArrowUp />
                        </button>
                        <span style={{
                            color: userVote === 'up' ? '#FF4500' : userVote === 'down' ? '#7193FF' : 'inherit',
                            fontWeight: 'bold'
                        }}>
                            {score}
                        </span>
                        <button
                            className={styles.actionBtn}
                            onClick={() => handleVote('down')}
                            style={{ color: userVote === 'down' ? '#7193FF' : 'inherit' }}
                        >
                            <FaArrowDown />
                        </button>
                    </div>

                    <button className={styles.actionBtn} onClick={handleReplyClick}>
                        <FaCommentAlt /> Reply
                    </button>
                </div>


                {/* Reply Form */}
                {isReplying && (
                    <div style={{ paddingLeft: '38px', marginTop: '10px' }}>
                        <CommentForm
                            onSubmit={(text) => {
                                onReply(text, comment._id);
                                setIsReplying(false);
                            }}
                            onCancel={() => setIsReplying(false)}
                            authorName={session?.user?.username}
                            isReply
                        />
                    </div>
                )}
            </div>

            {/* Children */}
            {comment.children && comment.children.length > 0 && (
                <div className={styles.children}>
                    {comment.children.map(child => (
                        <CommentItem
                            key={child._id}
                            comment={child}
                            depth={depth + 1}
                            onReply={onReply}
                            session={session}
                            isModalOpen={isModalOpen}
                            setIsModalOpen={setIsModalOpen}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function CommentForm({ onSubmit, onCancel, authorName, isReply = false }) {
    const [text, setText] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSubmit(text);
        setText('');
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            {!isReply && <p style={{ marginBottom: '8px', fontSize: '12px', color: 'var(--color-text-main)' }}>Comment as <span style={{ color: 'var(--color-primary)' }}>{authorName}</span></p>}
            <textarea
                className="input-field"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="What are your thoughts?"
                rows={4}
                style={{ marginBottom: '8px', width: '100%', background: 'var(--color-input)', color: 'var(--color-text-main)', border: '1px solid var(--color-border)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                {onCancel && (
                    <button type="button" onClick={onCancel} className="btn" style={{ background: 'transparent', color: 'var(--color-text-main)' }}>Cancel</button>
                )}
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!text.trim()}
                    style={{ borderRadius: '99px', padding: '6px 16px', fontWeight: 'bold' }}
                >
                    {isReply ? 'Reply' : 'Comment'}
                </button>
            </div>
        </form>
    );
}

export default function CommentsSection({ postId, initialComments }) {
    const { data: session } = useSession();
    // Rebuild tree on every render from flat list? Or utilize state properly.
    // initialComments is flat from DB usually?
    const [comments, setComments] = useState(initialComments || []);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Helper to build tree from flat list
    const buildTree = (flatComments) => {
        const map = {};
        const roots = [];
        // Deep copy
        const list = flatComments.map(c => ({ ...c, children: [] }));

        list.forEach((comment, i) => {
            map[comment._id] = i;
        });

        list.forEach(comment => {
            if (comment.parentComment && map[comment.parentComment] !== undefined) {
                list[map[comment.parentComment]].children.push(comment);
            } else {
                roots.push(comment);
            }
        });
        return roots;
    };

    const handleCommentSubmit = async (text, parentId = null) => {
        try {
            const res = await fetch(`/api/posts/${postId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: text, parentComment: parentId }),
            });

            if (res.ok) {
                const newComment = await res.json();
                // Add to flat list
                setComments(prev => [...prev, newComment]);
            }
        } catch (error) {
            console.error('Failed to post comment', error);
        }
    };

    const handleCommentEdit = async (commentId, newText) => {
        try {
            const res = await fetch(`/api/comments/${commentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newText }),
            });

            if (res.ok) {
                // Update local state
                setComments(prev => prev.map(c =>
                    c._id === commentId ? { ...c, content: newText } : c
                ));
            }
        } catch (error) {
            console.error('Failed to edit comment', error);
        }
    };

    const handleCommentDelete = async (commentId) => {
        try {
            const res = await fetch(`/api/comments/${commentId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                const data = await res.json();
                if (data.deletedIds) {
                    // Cascade delete update: remove all deleted IDs from local state
                    setComments(prev => prev.filter(c => !data.deletedIds.includes(c._id)));
                } else if (data.soft) {
                    // Soft delete update
                    setComments(prev => prev.map(c =>
                        c._id === commentId ? { ...c, content: '[deleted]', author: null } : c
                    ));
                } else {
                    // Hard delete fallback
                    setComments(prev => prev.filter(c => c._id !== commentId));
                }
            }
        } catch (error) {
            console.error('Failed to delete comment', error);
        }
    };

    const commentTree = buildTree(comments);

    return (
        <div className={styles.container}>
            <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

            {session ? (
                <CommentForm
                    onSubmit={(text) => handleCommentSubmit(text)}
                    authorName={session.user.username}
                />
            ) : (
                <div className={styles.loginPrompt}>
                    <p>Log in to comment</p>
                    <button onClick={() => setIsModalOpen(true)} className="btn btn-primary" style={{ borderRadius: '99px' }}>Log In</button>
                </div>
            )}

            <div className={styles.commentList}>
                {commentTree.map(comment => (
                    <CommentItem
                        key={comment._id}
                        comment={comment}
                        onReply={handleCommentSubmit}
                        onEdit={handleCommentEdit}
                        onDelete={handleCommentDelete}
                        session={session}
                        isModalOpen={isModalOpen}
                        setIsModalOpen={setIsModalOpen}
                    />
                ))}
            </div>
        </div>
    );
}
