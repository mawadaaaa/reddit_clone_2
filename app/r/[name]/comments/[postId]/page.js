import dbConnect from '@/lib/db';
import Post from '@/models/Post';
import Comment from '@/models/Comment';
import Community from '@/models/Community';
import PostCard from '@/components/PostCard';
import CommentsSection from '@/components/CommentsSection';
import RightSidebar from '@/components/RightSidebar';
import Link from 'next/link';

async function getPost(id) {
    await dbConnect();
    const post = await Post.findById(id).populate('author', 'username').populate('community', 'name');
    if (!post) return null;
    return JSON.parse(JSON.stringify(post));
}

async function getComments(postId) {
    await dbConnect();
    const comments = await Comment.find({ post: postId })
        .populate('author', 'username')
        .sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(comments));
}

async function getTopCommunities() {
    await dbConnect();
    const communities = await Community.find({}).limit(5);
    return JSON.parse(JSON.stringify(communities));
}

export default async function SinglePostPage({ params }) {
    const resolvedParams = await params;
    const post = await getPost(resolvedParams.postId);

    if (!post) {
        return (
            <div className="container">
                <div className="card">Post not found</div>
            </div>
        );
    }

    const comments = await getComments(resolvedParams.postId);
    const communities = await getTopCommunities();

    return (
        <div className="page-layout" style={{ marginTop: '20px' }}>
            <div className="feed-column">
                <PostCard post={post} communityName={post.community?.name} enableAI={true} />

                <div className="card" style={{ marginTop: '16px', padding: 0, overflow: 'hidden' }}>
                    <CommentsSection postId={post._id} initialComments={comments} />
                </div>
            </div>

            <div className="sidebar-column">
                <div className="card" style={{ marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '14px', marginBottom: '12px' }}>About {post.community?.name}</h3>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-dim)', marginBottom: '16px' }}>
                        Welcome to r/{post.community?.name}
                    </p>
                    <Link href={`/r/${post.community?.name}`} className="btn btn-primary" style={{ width: '100%' }}>
                        Visit Community
                    </Link>
                </div>

                <RightSidebar communities={communities} />
            </div>
        </div>
    );
}
