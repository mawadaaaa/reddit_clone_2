import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';

export async function GET() {
    try {
        await dbConnect();
        const count = await Post.countDocuments();
        const uri = process.env.MONGODB_URI ? 'Defined' : 'Undefined';
        const maskedUri = process.env.MONGODB_URI ? process.env.MONGODB_URI.replace(/:([^@]+)@/, ':****@') : 'N/A';

        return NextResponse.json({
            status: 'Connected',
            postCount: count,
            uriStatus: uri,
            maskedUri: maskedUri
        });
    } catch (error) {
        return NextResponse.json({
            status: 'Error',
            error: error.message
        }, { status: 500 });
    }
}
