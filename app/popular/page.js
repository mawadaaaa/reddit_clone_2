import PostCard from '@/components/PostCard';
import RightSidebar from '@/components/RightSidebar';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';
import Community from '@/models/Community';
import Comment from '@/models/Comment';

export const dynamic = 'force-dynamic';

async function getPopularFeed() {
    await dbConnect();
    // Sort posts by upvotes count descending (approximation since we store array of ids)
    // Mongoose sort by array length is tricky without aggregation, for now simpler sort by new 
    // or use aggregation if we want strict popularity.
    // Let's use simple sort by createdAt for now to ensure it works, then maybe specific sort?
    // Actually, let's use aggregation to sort by vote count size.
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

    // Need to populate manually or use lookup since aggregate returns plain objects
    // Let's use lookup for author and community
    const populated = await Post.populate(posts, [
        { path: 'author', select: 'username' },
        { path: 'community', select: 'name icon' }
    ]);

    const postsWithCounts = await Promise.all(populated.map(async (post) => {
        const commentCount = await Comment.countDocuments({ post: post._id });
        return { ...post, commentCount };
    }));

    return JSON.parse(JSON.stringify(postsWithCounts));
}

async function getTopCommunities() {
    await dbConnect();
    const communities = await Community.find({}).limit(5);
    return JSON.parse(JSON.stringify(communities));
}

export default async function PopularPage() {
    const posts = await getPopularFeed();
    const communities = await getTopCommunities();

    return (
        <div className="page-layout" style={{ marginTop: '20px' }}>
            <div className="feed-column">
                <h1 style={{ marginBottom: '20px', fontSize: '22px' }}>Popular Posts</h1>
                {posts.map(post => (
                    <PostCard
                        key={post._id}
                        post={post}
                        communityName={post.community?.name}
                    />
                ))}
            </div>
            <div className="sidebar-column">
                <RightSidebar communities={communities} />
            </div>
        </div>
    );
}
