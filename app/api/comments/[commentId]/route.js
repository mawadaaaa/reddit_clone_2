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

        // Verify ownership
        // Note: verifying via string comparison of IDs
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

        // Recursive function to find all descendants
        async function getDescendants(parentId) {
            const children = await Comment.find({ parentComment: parentId });
            let ids = children.map(c => c._id);
            for (const child of children) {
                const grandChildrenIds = await getDescendants(child._id);
                ids = [...ids, ...grandChildrenIds];
            }
            return ids;
        }

        const descendantIds = await getDescendants(commentId);
        const allIdsToDelete = [commentId, ...descendantIds];

        // Delete all
        await Comment.deleteMany({ _id: { $in: allIdsToDelete } });

        return NextResponse.json({ message: 'Comment and replies deleted', deletedIds: allIdsToDelete }, { status: 200 });

    } catch (error) {
        console.error('Delete comment error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
