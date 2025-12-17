import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Community from '@/models/Community';
import { handler as authOptions } from '../auth/[...nextauth]/route';

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { name, description } = await req.json();

        if (!name) {
            return NextResponse.json({ message: 'Community name is required' }, { status: 400 });
        }

        const existingCommunity = await Community.findOne({ name });
        if (existingCommunity) {
            return NextResponse.json({ message: 'Community already exists' }, { status: 400 });
        }

        const newCommunity = await Community.create({
            name,
            description,
            creator: session.user.id,
            members: [session.user.id], // Creator automatically joins
        });

        return NextResponse.json(newCommunity, { status: 201 });
    } catch (error) {
        console.error('Create community error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        await dbConnect();
        // Default limit 20
        const communities = await Community.find({}).limit(20);
        return NextResponse.json(communities, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
