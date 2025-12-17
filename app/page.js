import Link from 'next/link';
import PostCard from '@/components/PostCard';
import CreatePostBar from '@/components/CreatePostBar';
import RightSidebar from '@/components/RightSidebar';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';
import Community from '@/models/Community';

import User from '@/models/User';

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

export const dynamic = 'force-dynamic';

export default async function Home() {
  const posts = await getFeed();
  const communities = await getTopCommunities();

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
        <RightSidebar communities={communities} />

        {/* Sticky footer area often found in Reddit right rail */}
        <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--color-text-dim)' }}>
          <p>Reddit, Inc. © 2025. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
