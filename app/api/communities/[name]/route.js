import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Community from '@/models/Community';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { name } = await params;

        const community = await Community.findOne({ name });

        if (!community) {
            return NextResponse.json({ message: 'Community not found' }, { status: 404 });
        }

        return NextResponse.json(community, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
