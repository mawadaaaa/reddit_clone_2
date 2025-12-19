const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const Community = require('../models/Community');

// Use env var or fallback
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mawada:3AcloApEh4AvLP6B@cluster0.kfgxowi.mongodb.net/reddit_clone?retryWrites=true&w=majority&appName=Cluster0';

async function debugFeed() {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');

    try {
        const user = await User.findOne({ username: 'funny_cat' });
        if (!user) {
            console.log('User funny_cat not found');
            return;
        }
        console.log('User found:', user.username);
        console.log('Custom Feeds:', JSON.stringify(user.customFeeds, null, 2));

        const wowFeed = user.customFeeds.find(f => f.name === 'wow');
        if (!wowFeed) {
            console.log('Feed "wow" not found');
            return;
        }

        const communityIds = wowFeed.communities;
        console.log('Feed Community IDs:', communityIds);
        console.log('Type of first ID:', typeof communityIds[0]);

        // Check r/memes
        const memes = await Community.findOne({ name: 'memes' });
        if (!memes) {
            console.log('r/memes not found');
        } else {
            console.log('r/memes ID:', memes._id);
            console.log('Does feed contain r/memes?', communityIds.some(id => id.toString() === memes._id.toString()));
        }

        // Check posts
        const posts = await Post.find({ community: { $in: communityIds } });
        console.log('Posts found via $in query:', posts.length);

        if (posts.length === 0) {
            console.log('--- Deep Dive ---');
            // Check if any posts exist for this community ID manually
            const manualPosts = await Post.find({ community: memes._id });
            console.log('Posts found via manual ID query:', manualPosts.length);
            if (manualPosts.length > 0) {
                console.log('First manual post community type:', typeof manualPosts[0].community);
                console.log('First manual post community value:', manualPosts[0].community);
            }
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

debugFeed();
