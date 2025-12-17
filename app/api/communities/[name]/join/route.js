import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Community from '@/models/Community';
import { handler as authOptions } from '../../auth/[...nextauth]/route';

export async function POST(req, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { name } = params;
        const community = await Community.findOne({ name });

        if (!community) {
            return NextResponse.json({ message: 'Community not found' }, { status: 404 });
        }

        const userId = session.user.id;
        const isMember = community.members.includes(userId);

        if (isMember) {
            // Leave
            await Community.updateOne({ _id: community._id }, { $pull: { members: userId } });
            return NextResponse.json({ message: 'Left community', isMember: false }, { status: 200 });
        } else {
            // Join
            await Community.updateOne({ _id: community._id }, { $addToSet: { members: userId } });
            return NextResponse.json({ message: 'Joined community', isMember: true }, { status: 200 });
        }

    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
