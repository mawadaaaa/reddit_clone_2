'use client';

import Link from 'next/link';
import { FaReddit, FaArrowUp, FaCommentAlt } from 'react-icons/fa';
import styles from './RecentPosts.module.css';

export default function RecentPosts({ posts }) {
  if (!posts || posts.length === 0) return null;

  return (
    <div className={styles.widget}>
      <div className={styles.widgetHeader}>
        <h2>RECENT POSTS</h2>
        <button className={styles.clearBtn} onClick={() => alert('Clear functionality not implemented yet')}>Clear</button>
      </div>
      <ul className={styles.list}>
        {posts.map((item, idx) => {
          // Handle case where post might be null/deleted
          const post = item.post;
          if (!post) return null;

          return (
            <li key={post._id || idx} className={styles.item}>

              <div className={styles.info}>
                <div className={styles.metaRow}>
                  {/* Community Icon & Name */}
                  <div className={styles.communityIcon}>
                    <FaReddit size={16} />
                  </div>
                  <Link href={`/r/${post.community?.name || 'unknown'}`} className={styles.communityName}>
                    r/{post.community?.name || 'unknown'}
                  </Link>
                  <span className={styles.dot}>•</span>
                  <span className={styles.timeAgo}>
                    {Math.floor((new Date() - new Date(post.createdAt)) / (1000 * 60 * 60 * 24)) > 0
                      ? `${Math.floor((new Date() - new Date(post.createdAt)) / (1000 * 60 * 60 * 24))}y ago` // Basic mock specific to screenshot style, usually would be dynamic
                      : 'recently'}
                  </span>
                </div>

                <Link href={`/r/${post.community?.name}/comments/${post._id}`} className={styles.title}>
                  {post.title}
                </Link>

                <div className={styles.statsRow}>
                  <span className={styles.stat}>
                    {(post.upvotes?.length || 0) - (post.downvotes?.length || 0)} upvotes
                  </span>
                  <span className={styles.dot}>•</span>
                  <span className={styles.stat}>{post.comments?.length || 0} comments</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
