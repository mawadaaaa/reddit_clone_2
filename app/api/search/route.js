import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Community from '@/models/Community';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q');

        if (!query) {
            return NextResponse.json({ users: [], communities: [] });
        }

        const regex = new RegExp('^' + query, 'i');

        const users = await User.find({ username: regex }).select('username image').limit(5);
        const communities = await Community.find({ name: regex }).select('name description members icon').limit(5);

        return NextResponse.json({ users, communities });
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
