import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';
import { handler as authOptions } from '../../../auth/[...nextauth]/route';

export async function POST(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { postId } = params;
        const { type } = await req.json(); // 'up' or 'down'

        const post = await Post.findById(postId);
        if (!post) {
            return NextResponse.json({ message: 'Post not found' }, { status: 404 });
        }

        const userId = session.user.id;

        // Remove existing votes
        let upvotes = post.upvotes.map(id => id.toString());
        let downvotes = post.downvotes.map(id => id.toString());

        const isUpvoted = upvotes.includes(userId);
        const isDownvoted = downvotes.includes(userId);

        // Reset logic
        if (isUpvoted) {
            upvotes = upvotes.filter(id => id !== userId);
        }
        if (isDownvoted) {
            downvotes = downvotes.filter(id => id !== userId);
        }

        // Apply new vote
        if (type === 'up') {
            if (!isUpvoted) upvotes.push(userId);
        } else if (type === 'down') {
            if (!isDownvoted) downvotes.push(userId);
        }

        post.upvotes = upvotes;
        post.downvotes = downvotes;
        await post.save();

        return NextResponse.json({
            upvotes: post.upvotes,
            downvotes: post.downvotes,
            score: post.upvotes.length - post.downvotes.length
        }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
