import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';
import Community from '@/models/Community';
import Comment from '@/models/Comment'; // Add import
import User from '@/models/User';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function POST(req, { params }) {
    try {
        const { name } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        // const { name } = params; // Moved up
        const { title, content, image, video, link } = await req.json();

        const community = await Community.findOne({ name });
        if (!community) {
            return NextResponse.json({ message: 'Community not found' }, { status: 404 });
        }

        const newPost = await Post.create({
            title,
            content,
            image,
            video,
            link,
            community: community._id,
            author: session.user.id,
        });

        await User.findByIdAndUpdate(session.user.id, {
            $push: {
                recentInteractions: {
                    $each: [{ post: newPost._id, interactedAt: new Date(), type: 'create' }],
                    $position: 0,
                    $slice: 10 // Keep only last 10 interactions
                }
            }
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
        const { name } = await params;
        const community = await Community.findOne({ name });

        if (!community) {
            return NextResponse.json({ message: 'Community not found' }, { status: 404 });
        }

        const posts = await Post.find({ community: community._id })
            .populate('author', 'username')
            .sort({ createdAt: -1 })
            .lean();

        const postsWithCounts = await Promise.all(posts.map(async (post) => {
            const commentCount = await Comment.countDocuments({ post: post._id });
            return { ...post, commentCount };
        }));

        return NextResponse.json(postsWithCounts, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
