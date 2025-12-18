import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { authOptions } from '../auth/[...nextauth]/route';

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { image, banner, about, displayName } = await req.json();

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      {
        image,
        banner,
        about,
        displayName
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('Settings Update Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
