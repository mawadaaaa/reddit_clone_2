'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import styles from './CommentsSection.module.css';
import AuthModal from './AuthModal';
import { FaCommentAlt } from 'react-icons/fa';

export default function CommentsSection({ postId, initialComments }) {
    const { data: session } = useSession();
    const [comments, setComments] = useState(initialComments);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null); // ID of comment being replied to

    // Transform flat list to tree
    const buildTree = (comments) => {
        const map = {};
        const roots = [];
        // Deep copy to avoid mutating original props if strict
        const list = comments.map(c => ({ ...c, children: [] }));

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

    const commentTree = buildTree(comments);

    const handleSubmit = async (e, parentId = null) => {
        e.preventDefault();

        // Use local content for main form, or a different state for replies?
        // For simplicity, let's assume this handles the main form.
        // For replies, we might need a separate submission handler or state.

        // Actually, let's reuse this logic. If parentId is passed, use it.
        const textToSend = parentId ? e.target.replyContent.value : content;

        if (!textToSend.trim()) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/posts/${postId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: textToSend, parentComment: parentId }),
            });

            if (res.ok) {
                const newComment = await res.json();
                setComments([newComment, ...comments]); // Prepend to flat list, tree rebuilds automatically
                if (!parentId) setContent('');
                setReplyingTo(null);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const CommentItem = ({ comment }) => (
        <div className={styles.comment}>
            <div className={styles.commentHeader}>
                <span className={styles.author}>{comment.author?.username || 'deleted'}</span>
                <span className={styles.date}>{new Date(comment.createdAt).toLocaleDateString()}</span>
            </div>
            <div className={styles.commentBody}>
                {comment.content}
            </div>

            <div className={styles.actions}>
                <button
                    className={styles.replyBtn}
                    onClick={() => {
                        if (!session) setIsModalOpen(true);
                        else setReplyingTo(replyingTo === comment._id ? null : comment._id);
                    }}
                >
                    <FaCommentAlt /> Reply
                </button>
            </div>

            {replyingTo === comment._id && (
                <form onSubmit={(e) => handleSubmit(e, comment._id)} className={styles.form} style={{ marginTop: '8px', marginLeft: '20px' }}>
                    <textarea
                        name="replyContent"
                        className="input-field"
                        placeholder="What are your thoughts?"
                        rows={3}
                        style={{ marginBottom: '8px' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button type="button" onClick={() => setReplyingTo(null)} className="btn btn-outline">Cancel</button>
                        <button type="submit" className="btn btn-primary">Reply</button>
                    </div>
                </form>
            )}

            {comment.children.length > 0 && (
                <div className={styles.replies}>
                    {comment.children.map(child => (
                        <CommentItem key={child._id} comment={child} />
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className={styles.container}>
            <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

            {session ? (
                <form onSubmit={(e) => handleSubmit(e, null)} className={styles.form}>
                    <p style={{ marginBottom: '8px', fontSize: '12px' }}>Comment as {session.user.username}</p>
                    <textarea
                        className="input-field"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What are your thoughts?"
                        rows={4}
                        style={{ marginBottom: '8px' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading || !content.trim()}
                        >
                            Comment
                        </button>
                    </div>
                </form>
            ) : (
                <div className={styles.loginPrompt}>
                    <p>Log in to comment</p>
                    <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">Log In</button>
                </div>
            )}

            <div className={styles.list}>
                {commentTree.map(comment => (
                    <CommentItem key={comment._id} comment={comment} />
                ))}
            </div>
        </div>
    );
}
