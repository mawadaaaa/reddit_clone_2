import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Post from '@/models/Post';
import PostCard from '@/components/PostCard';

async function getUser(username) {
    await dbConnect();
    const user = await User.findOne({ username });
    if (!user) return null;
    return JSON.parse(JSON.stringify(user));
}

async function getUserPosts(userId) {
    await dbConnect();
    const posts = await Post.find({ author: userId })
        .populate('community', 'name')
        .populate('author', 'username')
        .sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(posts));
}

export default async function ProfilePage({ params }) {
    const user = await getUser(params.username);

    if (!user) {
        notFound();
    }

    const posts = await getUserPosts(user._id);

    return (
        <div className="container" style={{ marginTop: '20px', display: 'flex', gap: '24px' }}>
            <div style={{ flex: 1 }}>
                <h1 style={{ marginBottom: '20px' }}>u/{user.username} posts</h1>
                {posts.length === 0 ? (
                    <div className="card">This user hasn't posted anything yet.</div>
                ) : (
                    posts.map(post => (
                        <PostCard key={post._id} post={post} communityName={post.community?.name} />
                    ))
                )}
            </div>

            <div style={{ width: '300px' }}>
                <div className="card" style={{ textAlign: 'center' }}>
                    <div style={{ width: '80px', height: '80px', background: '#FF4500', borderRadius: '50%', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '40px' }}>
                        {user.username[0].toUpperCase()}
                    </div>
                    <h2>u/{user.username}</h2>
                    <p style={{ marginTop: '10px', color: '#666' }}>Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    );
}
