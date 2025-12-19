import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Comment from '@/models/Comment';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function POST(req, { params }) {
    try {
        const { commentId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const { type } = await req.json(); // 'up' or 'down'

        const userId = session.user.id;

        const comment = await Comment.findById(commentId);
        if (!comment) return NextResponse.json({ message: 'Comment not found' }, { status: 404 });

        // Check if IDs exist in arrays
        const isUpvoted = comment.upvotes && comment.upvotes.map(id => id.toString()).includes(userId);
        const isDownvoted = comment.downvotes && comment.downvotes.map(id => id.toString()).includes(userId);

        if (type === 'up') {
            if (isUpvoted) {
                // Remove upvote
                await Comment.findByIdAndUpdate(commentId, { $pull: { upvotes: userId } });
            } else {
                // Add upvote, remove downvote
                await Comment.findByIdAndUpdate(commentId, {
                    $addToSet: { upvotes: userId },
                    $pull: { downvotes: userId }
                });
            }
        } else if (type === 'down') {
            if (isDownvoted) {
                // Remove downvote
                await Comment.findByIdAndUpdate(commentId, { $pull: { downvotes: userId } });
            } else {
                // Add downvote, remove upvote
                await Comment.findByIdAndUpdate(commentId, {
                    $addToSet: { downvotes: userId },
                    $pull: { upvotes: userId }
                });
            }
        }

        // Fetch updated comment for fresh counts
        const updatedComment = await Comment.findById(commentId);

        return NextResponse.json({
            upvotes: updatedComment.upvotes,
            downvotes: updatedComment.downvotes,
            score: updatedComment.upvotes.length - updatedComment.downvotes.length
        }, { status: 200 });

    } catch (error) {
        console.error('Comment vote error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
