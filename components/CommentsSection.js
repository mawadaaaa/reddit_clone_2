'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import styles from './CommentsSection.module.css';
import AuthModal from './AuthModal';
import { FaArrowUp, FaArrowDown, FaCommentAlt, FaReply } from 'react-icons/fa';

// Recursive Comment Item Component
// Recursive Comment Item Component
function CommentItem({ comment, depth = 0, onReply, onEdit, onDelete, session, isModalOpen, setIsModalOpen }) {
    const [collapsed, setCollapsed] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment.content);

    // Initial state
    const [score, setScore] = useState((comment.upvotes?.length || 0) - (comment.downvotes?.length || 0));
    const [userVote, setUserVote] = useState(() => {
        if (!session) return null;
        if (comment.upvotes?.includes(session.user.id)) return 'up';
        if (comment.downvotes?.includes(session.user.id)) return 'down';
        return null;
    });

    const isAuthor = session?.user?.id === comment.author?._id;
    const isDeleted = comment.isDeleted;

    const handleReplyClick = () => {
        if (!session) {
            setIsModalOpen(true);
        } else {
            setIsReplying(!isReplying);
        }
    };

    const handleVote = async (type) => {
        if (isDeleted) return;
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

    const handleEditSubmit = (e) => {
        e.preventDefault();
        onEdit(comment._id, editText);
        setIsEditing(false);
    };

    if (collapsed) {
        return (
            <div className={styles.commentContainer} style={{ marginLeft: depth > 0 ? 0 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <button onClick={() => setCollapsed(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-dim)' }}>
                        [+]
                    </button>
                    <span className={styles.author} style={{ fontSize: '12px' }}>{isDeleted ? '[deleted]' : comment.author?.username || 'deleted'}</span>
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
                    {!comment.author ? (
                        /* User Deleted Case */
                        <div
                            style={{ cursor: 'pointer' }}
                            onClick={() => alert('User no longer exists')}
                        >
                            <div className={styles.avatar} style={{ background: '#333' }} />
                        </div>
                    ) : (
                        /* User Exists (Even if comment is deleted) */
                        <Link href={`/u/${comment.author.username}`} style={{ textDecoration: 'none' }}>
                            <img
                                src={comment.author.image || `https://api.dicebear.com/7.x/identicon/svg?seed=${comment.author.username}`}
                                alt="avatar"
                                className={styles.avatar}
                                style={{ objectFit: 'cover' }}
                            />
                        </Link>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {!comment.author ? (
                                <span
                                    className={styles.author}
                                    onClick={() => alert('User no longer exists')}
                                    style={{ cursor: 'pointer', fontStyle: 'italic', color: 'var(--color-text-dim)' }}
                                >
                                    [deleted]
                                </span>
                            ) : (
                                <Link href={`/u/${comment.author.username}`} className={styles.author}>
                                    {comment.author.username}
                                </Link>
                            )}
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
                    {isDeleted ? (
                        <span style={{ color: 'var(--color-text-dim)', fontStyle: 'italic' }}>[deleted]</span>
                    ) : isEditing ? (
                        <form onSubmit={handleEditSubmit} style={{ marginTop: '8px' }}>
                            <textarea
                                className="input-field"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                rows={3}
                                style={{ width: '100%', marginBottom: '8px', background: 'var(--color-input)', color: 'var(--color-text-main)', border: '1px solid var(--color-border)' }}
                            />
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button type="button" onClick={() => setIsEditing(false)} className="btn" style={{ background: 'transparent', color: 'var(--color-text-dim)' }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '12px' }}>Save</button>
                            </div>
                        </form>
                    ) : (
                        comment.content
                    )}
                </div>

                {/* Actions */}
                {!isDeleted && (
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

                        {isAuthor && (
                            <>
                                <button className={styles.actionBtn} onClick={() => setIsEditing(true)}>Edit</button>
                                <button className={styles.actionBtn} onClick={() => {
                                    if (confirm('Are you sure you want to delete this comment?')) {
                                        onDelete(comment._id);
                                    }
                                }}>Delete</button>
                            </>
                        )}
                    </div>
                )}


                {/* Reply Form */}
                {isReplying && !isDeleted && (
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
                            onEdit={onEdit}
                            onDelete={onDelete}
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
                if (data.soft) {
                    // Soft delete update
                    setComments(prev => prev.map(c =>
                        c._id === commentId ? { ...c, isDeleted: true, content: '[deleted]' } : c
                    ));
                } else if (data.deletedIds) {
                    // Hard delete update
                    setComments(prev => prev.filter(c => !data.deletedIds.includes(c._id)));
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
