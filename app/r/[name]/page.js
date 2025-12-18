import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Community from '@/models/Community';
import CommunityHeader from '@/components/CommunityHeader';
import CommunitySidebar from '@/components/CommunitySidebar';

// ... imports
import Post from '@/models/Post';
import PostCard from '@/components/PostCard';
import Link from 'next/link';

async function getCommunity(name) {
    await dbConnect();
    const community = await Community.findOne({ name });
    if (!community) return null;
    // Serialize Mongoose doc
    return JSON.parse(JSON.stringify(community));
}

import Comment from '@/models/Comment'; // Add import

async function getPosts(communityId) {
    await dbConnect();
    const posts = await Post.find({ community: communityId })
        .populate('author', 'username')
        .sort({ createdAt: -1 })
        .lean();

    // Aggregate comment counts manually since it's not in the Post schema
    const postsWithCounts = await Promise.all(posts.map(async (post) => {
        const commentCount = await Comment.countDocuments({ post: post._id });
        return { ...post, commentCount };
    }));

    return JSON.parse(JSON.stringify(postsWithCounts));
}

export default async function CommunityPage({ params }) {
    const { name } = await params;
    const community = await getCommunity(name);

    if (!community) {
        notFound();
    }

    const posts = await getPosts(community._id);

    return (
        <div>
            <CommunityHeader community={community} />
            <div className="container" style={{ marginTop: '20px', display: 'flex', gap: '24px' }}>
                <div style={{ flex: 1 }}>
                    {/* Old create post link removed as it is in header now */}
                    {posts.length === 0 ? (
                        <div className="card">No posts yet. Be the first to post!</div>
                    ) : (
                        posts.map(post => (
                            <PostCard key={post._id} post={post} communityName={community.name} />
                        ))
                    )}
                </div>
                <div style={{ width: '312px' }}>
                    <CommunitySidebar community={community} />
                </div>
            </div>
        </div>
    );
}
