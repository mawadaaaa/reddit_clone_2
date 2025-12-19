import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { postId } = await params;
        await dbConnect();

        const user = await User.findById(session.user.id);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const isSaved = user.saved.includes(postId);

        if (isSaved) {
            // Unsave
            user.saved = user.saved.filter(id => id.toString() !== postId);
        } else {
            // Save
            user.saved.push(postId);
        }

        await user.save();

        return NextResponse.json({ saved: !isSaved, message: isSaved ? 'Post unsaved' : 'Post saved' });

    } catch (error) {
        console.error('Error saving post:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ saved: false });
        }

        const { postId } = await params;
        await dbConnect();

        const user = await User.findById(session.user.id);
        if (!user) {
            return NextResponse.json({ saved: false });
        }

        const isSaved = user.saved.includes(postId);
        return NextResponse.json({ saved: isSaved });

    } catch (error) {
        console.error('Error checking save status:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
