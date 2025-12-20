import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Comment from '@/models/Comment';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function PUT(req, { params }) {
    try {
        const { commentId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { content } = await req.json();

        const comment = await Comment.findById(commentId);
        if (!comment) return NextResponse.json({ message: 'Comment not found' }, { status: 404 });

        if (comment.isDeleted) {
            return NextResponse.json({ message: 'Cannot edit deleted comment' }, { status: 400 });
        }

        // Verify ownership
        if (comment.author.toString() !== session.user.id) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        comment.content = content;
        await comment.save();

        // Populate author to return consistent object structure if needed
        await comment.populate('author', 'username');

        return NextResponse.json(comment, { status: 200 });

    } catch (error) {
        console.error('Update comment error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const { commentId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const targetComment = await Comment.findById(commentId);
        if (!targetComment) return NextResponse.json({ message: 'Comment not found' }, { status: 404 });

        if (targetComment.author.toString() !== session.user.id) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        // Check for replies
        const hasReplies = await Comment.exists({ parentComment: commentId });

        if (hasReplies) {
            // Soft delete
            targetComment.isDeleted = true;
            targetComment.content = '[deleted]';
            // We can choose to nullify author, but usually keeping the record associated with user but hidden is fine, 
            // or explicitly nullifying it. Reddit says "[deleted]" for author too.
            // Let's not nullify the actual field in DB for now to keep history if needed, but we will hiding it in UI.
            // Or typically set author to null or special system user.
            // Let's set author to null or handle in UI? 
            // For true "deleted" look, we should probably not delete the author ref in DB if we want to reverse it,
            // but the requirement says "like Reddit". Reddit removes author name.
            // Let's handle visual removal in UI based on isDeleted flag.

            await targetComment.save();
            return NextResponse.json({ message: 'Comment softly deleted', soft: true, commentId }, { status: 200 });
        } else {
            // Hard delete
            await Comment.findByIdAndDelete(commentId);
            return NextResponse.json({ message: 'Comment deleted', deletedIds: [commentId] }, { status: 200 });
        }

    } catch (error) {
        console.error('Delete comment error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
