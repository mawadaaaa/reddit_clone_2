import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';
import Comment from '@/models/Comment';
import User from '@/models/User';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function PUT(req, { params }) {
  try {
    const { postId } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { content } = await req.json();

    const post = await Post.findById(postId).populate('author');
    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    // Version ownership
    if (post.author.username !== session.user.name) {
      // extra check for robustness
      if (session.user.id && post.author._id.toString() !== session.user.id) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      } else if (!session.user.id && post.author.username !== session.user.name) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }
    }

    post.content = content;
    await post.save();

    return NextResponse.json(post, { status: 200 });
  } catch (error) {
    console.error('Update Post Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { postId } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Find post to ensure ownership
    const post = await Post.findById(postId).populate('author');
    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    // Verify ownership
    // Using loose comparison or username check as previously established, or ID if cleaner.
    // Assuming session.user.name matches author.username
    if (post.author.username !== session.user.name) {
      // double check if IDs match for robustness?
      // Let's stick to the existing check but might want to be safer if usernames change?
      // Actually, session.user.id is usually safer.
      // Let's try to see if we can use ID.
      if (session.user.id && post.author._id.toString() !== session.user.id) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      } else if (!session.user.id && post.author.username !== session.user.name) {
        // Fallback
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }
    }

    // 1. Delete all comments
    await Comment.deleteMany({ post: postId });

    // 2. Remove from User arrays (saved, hidden)
    // using $in for potentially one or the other, or just pull both
    await User.updateMany(
      {},
      { $pull: { saved: postId, hidden: postId } }
    );

    // 3. Remove from recentInteractions
    await User.updateMany(
      { 'recentInteractions.post': postId },
      { $pull: { recentInteractions: { post: postId } } }
    );

    // 4. Delete the post
    await Post.findByIdAndDelete(postId);

    return NextResponse.json({ message: 'Post and associated data deleted' }, { status: 200 });
  } catch (error) {
    console.error('Delete Post Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
