import Link from 'next/link';
import PostCard from '@/components/PostCard';
import CreatePostBar from '@/components/CreatePostBar';
import RightSidebar from '@/components/RightSidebar';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';
import Community from '@/models/Community';

import User from '@/models/User';
import RecentPosts from '@/components/RecentPosts';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

import Comment from '@/models/Comment'; // Add import

async function getFeed(userId = null) {
  await dbConnect();

  const query = {};
  if (userId) {
    query.author = { $ne: userId };
  }

  // Temporarily removed populate to test basic fetching -> Restoring now
  const posts = await Post.find(query)
    .populate('author', 'username')
    .populate('community', 'name')
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  const postsWithCounts = await Promise.all(posts.map(async (post) => {
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

async function getUserInteractions(userId) {
  await dbConnect();
  const user = await User.findById(userId).populate({
    path: 'recentInteractions.post',
    strictPopulate: false,
    populate: { path: 'community', select: 'name' }
  }).lean();

  if (!user || !user.recentInteractions) return [];

  const interactionsWithCounts = await Promise.all(user.recentInteractions.map(async (interaction) => {
    if (interaction.post) {
      const commentCount = await Comment.countDocuments({ post: interaction.post._id });
      // We need to mutate the interaction object or return a new structure
      // user.recentInteractions[i].post is an object now
      const postWithCount = { ...interaction.post, commentCount };
      return { ...interaction, post: postWithCount };
    }
    return interaction;
  }));

  return JSON.parse(JSON.stringify(interactionsWithCounts));
}

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await getServerSession(authOptions);
  const posts = await getFeed(session?.user?.id);
  const communities = await getTopCommunities();

  let recentPosts = [];
  if (session) {
    recentPosts = await getUserInteractions(session.user.id);
  }

  // Fallback/Mock for frontend dev: If no history, show feed posts
  if (recentPosts.length === 0 && posts.length > 0) {
    recentPosts = posts.slice(0, 5).map(post => ({ post }));
  }

  return (
    <div className="page-layout" style={{ marginTop: '20px' }}>
      <div className="feed-column">
        {/* Create Post Input Placeholder */}
        <CreatePostBar />

        {posts.length === 0 ? (
          <div className="card">No posts yet. Join a community and start posting!</div>
        ) : (
          posts.map(post => (
            <PostCard
              key={post._id}
              post={post}
              communityName={post.community?.name}
            />
          ))
        )}
      </div>

      <div className="sidebar-column">
        {session && recentPosts.length > 0 ? (
          <RecentPosts posts={recentPosts} />
        ) : (
          <RightSidebar communities={communities} />
        )}

        {/* Sticky footer area often found in Reddit right rail */}
        <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--color-text-dim)' }}>
          <p>Reddit, Inc. © 2025. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
