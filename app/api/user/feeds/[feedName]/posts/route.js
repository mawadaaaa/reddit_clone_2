import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Post from '@/models/Post';
import Community from '@/models/Community'; // Ensure model is registered

export async function GET(req, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { feedName } = await params;

    await dbConnect();

    try {
        const user = await User.findById(session.user.id);
        const feed = user.customFeeds.find(f => f.name === feedName);

        if (!feed) {
            console.log(`Feed not found: ${feedName}`);
            return NextResponse.json({ error: 'Feed not found' }, { status: 404 });
        }

        const communityIds = feed.communities || [];
        console.log(`Feed: ${feedName}, Community IDs: ${communityIds}`);

        // If no communities, return empty early
        if (communityIds.length === 0) {
            return NextResponse.json({ posts: [], communities: [] });
        }

        // Fetch posts from these communities
        const posts = await Post.find({ community: { $in: communityIds } })
            .sort({ createdAt: -1 })
            .populate('author', 'username')
            .populate('community', 'name icon themeColor')
            .lean();

        console.log(`Found ${posts.length} posts for feed ${feedName}`);

        // Add vote status for the current user
        const postsWithVotes = posts.map(post => {
            const upvotes = post.upvotes || [];
            const downvotes = post.downvotes || [];
            const userVote = upvotes.some(id => id.toString() === session.user.id) ? 1 :
                downvotes.some(id => id.toString() === session.user.id) ? -1 : 0;
            return {
                ...post,
                userVote,
                voteCount: upvotes.length - downvotes.length
            };
        });

        return NextResponse.json({ posts: postsWithVotes, communities: feed.communities });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
