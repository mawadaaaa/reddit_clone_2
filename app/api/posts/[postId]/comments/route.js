import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Comment from '@/models/Comment';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function POST(req, { params }) {
    try {
        const { postId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        // const { postId } = params;
        const { content, parentComment } = await req.json();

        const newComment = await Comment.create({
            content,
            post: postId,
            author: session.user.id,
            parentComment: parentComment || null,
        });

        // Populate author for immediate return
        await newComment.populate('author', 'username');

        return NextResponse.json(newComment, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { postId } = await params;

        const comments = await Comment.find({ post: postId })
            .populate('author', 'username')
            .sort({ createdAt: -1 });

        return NextResponse.json(comments, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
