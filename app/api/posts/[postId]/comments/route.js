import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Comment from '@/models/Comment';
import Post from '@/models/Post';
import Notification from '@/models/Notification';
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

        // 1. Create Comment
        const newComment = await Comment.create({
            content,
            post: postId,
            author: session.user.id,
            parentComment: parentComment || null,
        });

        // Populate author for immediate return
        await newComment.populate('author', 'username image');

        // 2. Notification Logic
        // We need to fetch the post to know the author
        // And if parentComment, fetch that too.

        try {
            const post = await Post.findById(postId);
            let recipientId = null;
            let type = 'post_reply';

            if (parentComment) {
                const parent = await Comment.findById(parentComment);
                if (parent) {
                    recipientId = parent.author;
                    type = 'comment_reply';
                }
            } else {
                // Top level comment -> notify post author
                if (post) {
                    recipientId = post.author;
                }
            }

            // Only notify if recipient exists AND isn't the sender (no self-notify)
            if (recipientId && recipientId.toString() !== session.user.id) {
                await Notification.create({
                    recipient: recipientId,
                    sender: session.user.id,
                    type,
                    post: postId,
                    comment: newComment._id
                });
            }

        } catch (notifError) {
            console.error('Notification creation failed (non-blocking):', notifError);
        }

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
            .populate('author', 'username image')
            .sort({ createdAt: -1 });

        return NextResponse.json(comments, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
