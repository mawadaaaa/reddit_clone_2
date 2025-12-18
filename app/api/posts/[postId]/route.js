import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function DELETE(req, { params }) {
  try {
    const { postId } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Find post to ensure ownership
    // params.postId matches the folder name [postId]
    const post = await Post.findById(postId).populate('author');
    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    if (post.author.username !== session.user.name) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await Post.findByIdAndDelete(postId);

    return NextResponse.json({ message: 'Post deleted' }, { status: 200 });
  } catch (error) {
    console.error('Delete Post Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
