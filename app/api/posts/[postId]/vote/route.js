import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function POST(req, { params }) {
    try {
        const { postId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const { type } = await req.json(); // 'up' or 'down'

        const userId = session.user.id;

        const post = await Post.findById(postId);
        if (!post) return NextResponse.json({ message: 'Post not found' }, { status: 404 });

        // Check if IDs exist in arrays (converting to strings for comparison safe-check)
        const isUpvoted = post.upvotes && post.upvotes.map(id => id.toString()).includes(userId);
        const isDownvoted = post.downvotes && post.downvotes.map(id => id.toString()).includes(userId);

        if (type === 'up') {
            if (isUpvoted) {
                // Remove upvote
                await Post.findByIdAndUpdate(postId, { $pull: { upvotes: userId } });
            } else {
                // Add upvote, remove downvote
                await Post.findByIdAndUpdate(postId, {
                    $addToSet: { upvotes: userId },
                    $pull: { downvotes: userId }
                });
            }
        } else if (type === 'down') {
            if (isDownvoted) {
                // Remove downvote
                await Post.findByIdAndUpdate(postId, { $pull: { downvotes: userId } });
            } else {
                // Add downvote, remove upvote
                await Post.findByIdAndUpdate(postId, {
                    $addToSet: { downvotes: userId },
                    $pull: { upvotes: userId }
                });
            }
        }

        // Fetch updated post
        const updatedPost = await Post.findById(postId);

        return NextResponse.json({
            upvotes: updatedPost.upvotes,
            downvotes: updatedPost.downvotes,
            score: updatedPost.upvotes.length - updatedPost.downvotes.length
        }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
