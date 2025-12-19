import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const notifications = await Notification.find({ recipient: session.user.id })
            .populate('sender', 'username image')
            .populate('post', 'title community') // we might need community name for link
            .sort({ createdAt: -1 })
            .limit(20);

        // Also get unread count
        const unreadCount = await Notification.countDocuments({
            recipient: session.user.id,
            read: false
        });

        return NextResponse.json({ notifications, unreadCount }, { status: 200 });
    } catch (error) {
        console.error('Fetch Notifications Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Mark all as read for now (simple)
        await Notification.updateMany(
            { recipient: session.user.id, read: false },
            { $set: { read: true } }
        );

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Update Notifications Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
