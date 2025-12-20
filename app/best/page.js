
import BestPostCard from '@/components/BestPostCard';
import RightSidebar from '@/components/RightSidebar';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';
import Community from '@/models/Community';
import styles from './best.module.css';

export const dynamic = 'force-dynamic';

async function getBestFeed() {
    await dbConnect();
    const posts = await Post.aggregate([
        {
            $addFields: {
                upvoteCount: { $size: { $ifNull: ["$upvotes", []] } },
                downvoteCount: { $size: { $ifNull: ["$downvotes", []] } }
            }
        },
        {
            $addFields: {
                score: { $subtract: ["$upvoteCount", "$downvoteCount"] }
            }
        },
        { $sort: { score: -1 } },
        { $limit: 20 }
    ]);

    const populated = await Post.populate(posts, [
        { path: 'author', select: 'username' },
        { path: 'community', select: 'name icon' }
    ]);

    return JSON.parse(JSON.stringify(populated));
}

async function getTopCommunities() {
    await dbConnect();
    const communities = await Community.find({}).limit(5);
    return JSON.parse(JSON.stringify(communities));
}

export default async function BestPage() {
    const posts = await getBestFeed();
    const communities = await getTopCommunities();

    return (
        <div className="page-layout" style={{ marginTop: '20px' }}>
            <div className="feed-column">
                <div className={styles.header}>
                    <h1 className={styles.title}>Best of Reddit</h1>
                    <div className={styles.subtitle}>TOP POSTS FROM THE PAST</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {posts.map(post => (
                        <BestPostCard
                            key={post._id}
                            post={post}
                        />
                    ))}
                </div>
            </div>
            <div className="sidebar-column">
                <RightSidebar communities={communities} title="TOP SUBREDDITS" />
            </div>
        </div>
    );
}
