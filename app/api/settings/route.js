import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { authOptions } from '../auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { image, banner, about, username, password } = await req.json();

    // 1. Validation
    if (!username || username.trim().length < 4) {
      return NextResponse.json({ message: 'Username must be at least 4 characters.' }, { status: 400 });
    }

    if (!/^[a-zA-Z]/.test(username)) {
      return NextResponse.json({ message: 'Username must start with a letter.' }, { status: 400 });
    }

    // 2. Uniqueness Check
    // Case-insensitive check against other usernames
    const existingUser = await User.findOne({
      username: { $regex: new RegExp(`^${username}$`, 'i') },
      _id: { $ne: session.user.id }
    });

    if (existingUser) {
      return NextResponse.json({ message: 'Username is already taken.' }, { status: 400 });
    }

    // 3. Prepare Update Data
    let updateData = {
      image,
      banner,
      about,
      username
    };

    // 4. Password Validation & Hashing
    if (password) {
      // Only validate and hash if a new password is provided
      if (password.length < 6) {
        return NextResponse.json({ message: 'Password must be at least 6 characters.' }, { status: 400 });
      }
      if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
        return NextResponse.json({ message: 'Password must contain both letters and numbers.' }, { status: 400 });
      }

      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    // 5. Update user
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('Settings Update Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
import Community from '@/models/Community';
import Post from '@/models/Post';
import Comment from '@/models/Comment';

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const userId = session.user.id;

    // 1. Remove user from Community members
    await Community.updateMany(
      { members: userId },
      { $pull: { members: userId } }
    );

    // 2. Remove user votes from Posts (upvotes and downvotes)
    await Post.updateMany(
      { $or: [{ upvotes: userId }, { downvotes: userId }] },
      {
        $pull: {
          upvotes: userId,
          downvotes: userId
        }
      }
    );

    // 3. Remove user votes from Comments
    await Comment.updateMany(
      { $or: [{ upvotes: userId }, { downvotes: userId }] },
      {
        $pull: {
          upvotes: userId,
          downvotes: userId
        }
      }
    );

    // 4. Delete user's Posts 
    // (Optional: Could anonymize instead, but user requested deletion)
    await Post.deleteMany({ author: userId });

    // 5. Delete user's Comments
    await Comment.deleteMany({ author: userId });

    // 6. Finally, Delete the user
    await User.findByIdAndDelete(userId);

    return NextResponse.json({ message: 'Account and all associated data deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete Account Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
