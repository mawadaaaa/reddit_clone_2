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

async function getFeed() {
  await dbConnect();
  // Temporarily removed populate to test basic fetching -> Restoring now
  const posts = await Post.find({})
    .populate('author', 'username')
    .populate('community', 'name')
    .sort({ createdAt: -1 })
    .limit(20);

  return JSON.parse(JSON.stringify(posts));
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
  });

  if (!user || !user.recentInteractions) return [];

  return JSON.parse(JSON.stringify(user.recentInteractions));
}

export const dynamic = 'force-dynamic';

export default async function Home() {
  const posts = await getFeed();
  const communities = await getTopCommunities();
  const session = await getServerSession(authOptions);

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
