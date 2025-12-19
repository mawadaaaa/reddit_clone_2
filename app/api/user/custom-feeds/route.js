import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Community from '@/models/Community';

// Create a new custom feed or add community to existing feed
export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    try {
        const { action, feedName, communityName } = await req.json(); // action: 'create' | 'add_community'
        const user = await User.findById(session.user.id);

        if (action === 'create') {
            if (user.customFeeds.find(f => f.name === feedName)) {
                return NextResponse.json({ error: 'Feed already exists' }, { status: 400 });
            }
            user.customFeeds.push({ name: feedName, communities: [] });
            await user.save();
            return NextResponse.json({ success: true, feed: user.customFeeds[user.customFeeds.length - 1] });
        }

        if (action === 'add_community') {
            const feed = user.customFeeds.find(f => f.name === feedName);
            if (!feed) return NextResponse.json({ error: 'Feed not found' }, { status: 404 });

            const community = await Community.findOne({ name: communityName });
            if (!community) return NextResponse.json({ error: 'Community not found' }, { status: 404 });

            // Check if already in feed (compare strings to be safe)
            const exists = feed.communities.some(id => id.toString() === community._id.toString());

            if (!exists) {
                feed.communities.push(community._id);
                user.markModified('customFeeds'); // Explicitly mark as modified
                await user.save();
            }
            return NextResponse.json({ success: true, added: !exists });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error("Custom Feed Error:", error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// Update a custom feed (e.g. remove community)
export async function PUT(req) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    try {
        const { action, feedName, communityId } = await req.json();
        const user = await User.findById(session.user.id);
        const feed = user.customFeeds.find(f => f.name === feedName);

        if (!feed) return NextResponse.json({ error: 'Feed not found' }, { status: 404 });

        if (action === 'remove_community') {
            feed.communities = feed.communities.filter(id => id.toString() !== communityId);
            user.markModified('customFeeds');
            await user.save();
            return NextResponse.json({ success: true, communities: feed.communities });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// Delete a custom feed
export async function DELETE(req) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    try {
        const { feedName } = await req.json();
        const user = await User.findById(session.user.id);

        user.customFeeds = user.customFeeds.filter(f => f.name !== feedName);
        user.markModified('customFeeds');
        await user.save();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// Get user custom feeds
export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    try {
        const user = await User.findById(session.user.id).populate('customFeeds.communities', 'name icon');
        return NextResponse.json(user.customFeeds);
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
