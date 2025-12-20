import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
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

        // Notification Logic
        try {
            // Only notify if loading a NEW vote (not untoggling)
            // Determining if it was a new vote or just a toggle is tricky with the current logic structure
            // But if we are here, we likely performed an action.
            // Let's check the type and current state again or just rely on the fact that if it wasn't already upvoted/downvoted, it's a new action.

            // Re-eval based on initial state 'isUpvoted' / 'isDownvoted'
            let shouldNotify = false;
            let notifType = null;

            if (type === 'up' && !isUpvoted) {
                shouldNotify = true;
                notifType = 'post_upvote';
            } else if (type === 'down' && !isDownvoted) {
                shouldNotify = true;
                notifType = 'post_downvote';
            }

            if (shouldNotify && post.author.toString() !== userId) {
                await Notification.create({
                    recipient: post.author,
                    sender: userId,
                    type: notifType,
                    post: postId,
                });
            }
        } catch (notifError) {
            console.error('Notification failed', notifError);
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
