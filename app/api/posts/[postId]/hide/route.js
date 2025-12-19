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

    const isHidden = user.hidden.includes(postId);

    if (isHidden) {
      // Unhide
      user.hidden = user.hidden.filter(id => id.toString() !== postId);
    } else {
      // Hide
      user.hidden.push(postId);
    }

    await user.save();

    return NextResponse.json({ hidden: !isHidden, message: isHidden ? 'Post unhidden' : 'Post hidden' });

  } catch (error) {
    console.error('Error hiding post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ hidden: false });
    }

    const { postId } = await params;
    await dbConnect();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ hidden: false });
    }

    const isHidden = user.hidden.includes(postId);
    return NextResponse.json({ hidden: isHidden });

  } catch (error) {
    console.error('Error checking hide status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
