import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';
import Community from '@/models/Community';
import User from '@/models/User';
import { handler as authOptions } from '../../../auth/[...nextauth]/route';

export async function POST(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { name } = params;
        const { title, content, image, video } = await req.json();

        const community = await Community.findOne({ name });
        if (!community) {
            return NextResponse.json({ message: 'Community not found' }, { status: 404 });
        }

        const newPost = await Post.create({
            title,
            content,
            image,
            video,
            community: community._id,
            author: session.user.id,
        });

        return NextResponse.json(newPost, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { name } = params;
        const community = await Community.findOne({ name });

        if (!community) {
            return NextResponse.json({ message: 'Community not found' }, { status: 404 });
        }

        const posts = await Post.find({ community: community._id })
            .populate('author', 'username')
            .sort({ createdAt: -1 });

        return NextResponse.json(posts, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
