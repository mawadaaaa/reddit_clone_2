import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Community from '@/models/Community';

// Toggle favorite status
export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    try {
        const { communityName } = await req.json();
        const community = await Community.findOne({ name: communityName });
        if (!community) return NextResponse.json({ error: 'Community not found' }, { status: 404 });

        const user = await User.findById(session.user.id);
        const isFavorite = user.favoriteCommunities.includes(community._id);

        if (isFavorite) {
            user.favoriteCommunities.pull(community._id);
        } else {
            user.favoriteCommunities.push(community._id);
        }

        await user.save();
        return NextResponse.json({ isFavorite: !isFavorite });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// Remove a favorite
// Remove a favorite
export async function DELETE(req) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    try {
        const { communityName, communityId } = await req.json();

        let targetId = communityId;

        // If name provided, find the ID - Supports client sending name
        if (communityName && !targetId) {
            const community = await Community.findOne({ name: communityName });
            if (community) targetId = community._id.toString();
        }

        if (!targetId) return NextResponse.json({ error: 'Community not found or Invalid ID' }, { status: 404 });

        const user = await User.findById(session.user.id);

        user.favoriteCommunities = user.favoriteCommunities.filter(id => id.toString() !== targetId);
        await user.save();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// Get user favorites
export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    try {
        const user = await User.findById(session.user.id).populate('favoriteCommunities', 'name icon');
        return NextResponse.json(user.favoriteCommunities || []);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
