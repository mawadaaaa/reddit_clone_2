import Link from 'next/link';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Post from '@/models/Post';
import Comment from '@/models/Comment';
import Community from '@/models/Community'; // Import Community explicitly
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

async function getUserComments(userId) {
    await dbConnect();
    const comments = await Comment.find({ author: userId })
        .populate({
            path: 'post',
            select: 'title community _id',
            populate: { path: 'community', select: 'name' }
        })
        .populate('author', 'username')
        .sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(comments));
}

// Fetchers for expanded tabs
async function getUserSaved(userId) {
    await dbConnect();
    const user = await User.findById(userId).populate({
        path: 'saved',
        populate: [
            { path: 'community', select: 'name' },
            { path: 'author', select: 'username' }
        ]
    });
    return user ? JSON.parse(JSON.stringify(user.saved)).reverse() : [];
}

async function getUserHidden(userId) {
    await dbConnect();
    const user = await User.findById(userId).populate({
        path: 'hidden',
        populate: [
            { path: 'community', select: 'name' },
            { path: 'author', select: 'username' }
        ]
    });
    return user ? JSON.parse(JSON.stringify(user.hidden)).reverse() : [];
}

async function getUserUpvoted(userId) {
    await dbConnect();
    const posts = await Post.find({ upvotes: userId })
        .populate('community', 'name')
        .populate('author', 'username')
        .sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(posts));
}

async function getUserDownvoted(userId) {
    await dbConnect();
    const posts = await Post.find({ downvotes: userId })
        .populate('community', 'name')
        .populate('author', 'username')
        .sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(posts));
}

export default async function ProfilePage({ params, searchParams }) {
    const { username } = await params;
    const { view } = await searchParams; // Get view param
    const currentView = view || 'overview'; // Default to overview

    const user = await getUser(username);

    if (!user) {
        notFound();
    }

    let posts = [];
    let comments = [];

    // Data fetching router
    if (currentView === 'overview' || currentView === 'posts') {
        posts = await getUserPosts(user._id);
    } else if (currentView === 'comments') {
        comments = await getUserComments(user._id);
    } else if (currentView === 'saved') {
        posts = await getUserSaved(user._id);
    } else if (currentView === 'hidden') {
        posts = await getUserHidden(user._id);
    } else if (currentView === 'upvoted') {
        posts = await getUserUpvoted(user._id);
    } else if (currentView === 'downvoted') {
        posts = await getUserDownvoted(user._id);
    } else if (currentView === 'history') {
        // Placeholder for history
        posts = [];
    }

    // Helper to generic active style
    const getTabStyle = (tabName) => {
        const isActive = currentView === tabName || (tabName === 'overview' && !view) || (tabName === 'posts' && view === 'posts');
        const activeColor = 'var(--color-text-main)';
        const inactiveColor = 'var(--color-text-dim)';

        let active = false;
        if (tabName === 'overview' && !view) active = true;
        else if (tabName === view) active = true;

        return {
            padding: '10px 16px',
            background: 'transparent',
            border: 'none',
            borderBottom: active ? '2px solid var(--color-text-main)' : '2px solid transparent',
            color: active ? activeColor : inactiveColor,
            fontWeight: '700',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            textDecoration: 'none',
            display: 'inline-block'
        };
    };

    return (
        <div style={{ maxWidth: '100%', overflowX: 'hidden' }}>
            {/* Banner */}
            <div style={{
                height: '150px',
                background: user.banner ? `url(${user.banner}) center/cover no-repeat` : '#33a8ff',
                width: '100%'
            }}></div>

            <div className="container" style={{ marginTop: '-40px', display: 'flex', gap: '24px', position: 'relative' }}>
                <div style={{ flex: 1, maxWidth: '800px' }}>
                    {/* Header Section in Main Column (Mobile/Tablet friendly structure) */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: '16px', paddingLeft: '16px' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            border: '4px solid var(--color-surface)',
                            background: '#fff',
                            overflow: 'hidden',
                            marginRight: '16px'
                        }}>
                            <img
                                src={user.image || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.username}`}
                                alt="avatar"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                        <div style={{ paddingBottom: '10px' }}>
                            <h1 style={{ fontSize: '24px', lineHeight: '1', marginBottom: '4px' }}>{user.displayName || user.username}</h1>
                            <span style={{ color: 'var(--color-text-dim)', fontSize: '14px' }}>u/{user.username}</span>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '16px', overflowX: 'auto' }}>
                        <Link href={`/u/${username}`} style={getTabStyle('overview')}>Overview</Link>
                        <Link href={`/u/${username}?view=posts`} style={getTabStyle('posts')}>Posts</Link>
                        <Link href={`/u/${username}?view=comments`} style={getTabStyle('comments')}>Comments</Link>
                        <Link href={`/u/${username}?view=saved`} style={getTabStyle('saved')}>Saved</Link>
                        <Link href={`/u/${username}?view=history`} style={getTabStyle('history')}>History</Link>
                        <Link href={`/u/${username}?view=hidden`} style={getTabStyle('hidden')}>Hidden</Link>
                        <Link href={`/u/${username}?view=upvoted`} style={getTabStyle('upvoted')}>Upvoted</Link>
                        <Link href={`/u/${username}?view=downvoted`} style={getTabStyle('downvoted')}>Downvoted</Link>
                    </div>

                    {/* Create Post Input Bar */}
                    {(currentView === 'overview' || currentView === 'posts') && (
                        <div className="card" style={{ display: 'flex', alignItems: 'center', padding: '8px', marginBottom: '16px' }}>
                            <div style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                marginRight: '8px',
                                background: '#ccc'
                            }}>
                                <img
                                    src={`https://api.dicebear.com/7.x/identicon/svg?seed=${user.username}`}
                                    alt="avatar"
                                    style={{ width: '100%', height: '100%' }}
                                />
                            </div>
                            <Link href="/r/popular/submit" style={{ flexGrow: 1 }}>
                                <input
                                    type="text"
                                    placeholder="Create Post"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '4px',
                                        border: '1px solid var(--color-border)',
                                        background: 'var(--color-input)',
                                        cursor: 'pointer'
                                    }}
                                    readOnly
                                />
                            </Link>
                            <Link href="/r/popular/submit" style={{ marginLeft: '8px', color: 'var(--color-text-dim)', fontSize: '20px' }}>
                                📷
                            </Link>
                            <Link href="/r/popular/submit" style={{ marginLeft: '8px', color: 'var(--color-text-dim)', fontSize: '20px' }}>
                                🔗
                            </Link>
                        </div>
                    )}

                    {currentView === 'comments' ? (
                        <div>
                            {comments.length === 0 ? (
                                <div className="card">No comments yet.</div>
                            ) : (
                                comments.map(comment => (
                                    <div key={comment._id} className="card" style={{ padding: '10px', fontSize: '14px' }}>
                                        <div style={{ marginBottom: '8px', color: 'var(--color-text-dim)', fontSize: '12px' }}>
                                            <Link href={`/u/${comment.author.username}`} style={{ color: 'var(--color-text-main)', fontWeight: 'bold' }}>{comment.author.username}</Link> commented on <Link href={`/r/${comment.post?.community?.name || 'unknown'}/comments/${comment.post?._id}`} style={{ color: 'var(--color-text-main)', fontWeight: 'bold' }}>{comment.post?.title || 'deleted post'}</Link> • <Link href={`/r/${comment.post?.community?.name || 'unknown'}`} style={{ color: 'var(--color-text-main)', fontWeight: 'bold' }}>r/{comment.post?.community?.name || 'unknown'}</Link>
                                        </div>
                                        <div style={{ padding: '8px', background: 'var(--color-bg)', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                                            {comment.content}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        // Default to Posts view (Overview/Posts/Saved/etc)
                        <div>
                            {posts.length === 0 ? (
                                <div className="card">
                                    {currentView === 'saved' ? 'No saved posts.' :
                                        currentView === 'hidden' ? 'No hidden posts.' :
                                            currentView === 'upvoted' ? 'No upvoted posts.' :
                                                currentView === 'downvoted' ? 'No downvoted posts.' :
                                                    currentView === 'history' ? 'History not available.' :
                                                        'This user hasn\'t posted anything yet.'}
                                </div>
                            ) : (
                                posts.map(post => (
                                    <PostCard key={post._id} post={post} communityName={post.community?.name} />
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Right Sidebar */}
                <div style={{ width: '312px' }} className="desktop-sidebar">
                    <div className="card" style={{ padding: '12px', background: 'var(--color-surface)' }}>
                        {/* Sidebar Header */}
                        <div style={{
                            height: '80px',
                            background: user.banner ? `url(${user.banner}) center/cover no-repeat` : '#33a8ff',
                            margin: '-12px -12px 12px -12px',
                            borderRadius: '4px 4px 0 0'
                        }}></div>
                        <div style={{ textAlign: 'center', marginTop: '-50px', marginBottom: '16px' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '10px',
                                border: '3px solid var(--color-surface)',
                                background: '#fff',
                                overflow: 'hidden',
                                margin: '0 auto',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <img
                                    src={user.image || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.username}`}
                                    alt="avatar"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                            <h2 style={{ fontSize: '16px', marginTop: '8px' }}>{user.displayName || user.username}</h2>
                            <p style={{ fontSize: '12px', color: 'var(--color-text-dim)' }}>u/{user.username}</p>
                        </div>

                        <button className="btn btn-primary" style={{ width: '100%', borderRadius: '999px', background: 'linear-gradient(90deg, #EC0623 0%, #FF8717 100%)', border: 'none' }}>
                            Create Avatar
                        </button>

                        <div style={{ padding: '16px 0', borderBottom: '1px solid var(--color-border)' }}>
                            <div style={{ fontSize: '14px', marginBottom: '12px' }}>
                                {user.about || "This user hasn't written a bio yet."}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ fontWeight: '700' }}>{
                                        posts.reduce((acc, curr) => acc + (curr.upvotes?.length || 0) - (curr.downvotes?.length || 0), 0)
                                    }</div>
                                    <div style={{ fontSize: '12px', color: 'var(--color-text-dim)' }}>Karma</div>
                                </div>
                                <div>
                                    <div style={{ fontWeight: '700' }}>{new Date(user.createdAt).toLocaleDateString()}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--color-text-dim)' }}>Cake Day</div>
                                </div>
                            </div>
                        </div>



                        <div style={{ marginTop: '24px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                            <Link href="/settings" className="btn btn-outline" style={{ width: '100%', borderRadius: '999px' }}>
                                Profile Settings
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
