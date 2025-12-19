import mongoose from 'mongoose';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';

// Hardcoded from known .env.local value
const MONGODB_URI = 'mongodb://127.0.0.1:27017/reddit_clone_2';

async function checkContent() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const postCount = await Post.countDocuments();
        const commentCount = await Comment.countDocuments();

        console.log(`Found ${postCount} posts.`);
        console.log(`Found ${commentCount} comments.`);

        // List a few recent ones for detail
        if (postCount > 0) {
            const recentPosts = await Post.find().sort({ createdAt: -1 }).limit(3).select('title');
            console.log('Recent Posts:', recentPosts.map(p => p.title));
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Content Check Error:', error);
        process.exit(1);
    }
}

checkContent();
