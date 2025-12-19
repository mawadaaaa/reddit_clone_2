const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const dbConnect = require('../lib/db');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/reddit_clone';

async function debugKarma() {
    await mongoose.connect(MONGODB_URI);

    // Find the user (assuming 'funny_cat_' or we list all)
    const users = await User.find({});

    for (const user of users) {
        console.log(`\nAnalyzing User: ${user.username} (${user._id})`);

        // Posts
        const posts = await Post.find({ author: user._id });
        let postKarma = 0;
        console.log(`  Posts: ${posts.length}`);
        posts.forEach((p, i) => {
            const score = (p.upvotes?.length || 0) - (p.downvotes?.length || 0);
            postKarma += score;
            console.log(`    ${i + 1}. "${p.title.substring(0, 20)}..." | Score: ${score} (+${p.upvotes?.length || 0} / -${p.downvotes?.length || 0})`);
        });

        // Comments
        const comments = await Comment.find({ author: user._id });
        let commentKarma = 0;
        console.log(`  Comments: ${comments.length}`);
        comments.forEach((c, i) => {
            const score = (c.upvotes?.length || 0) - (c.downvotes?.length || 0);
            commentKarma += score;
            console.log(`    ${i + 1}. "${c.content.substring(0, 20)}..." | Score: ${score} (+${c.upvotes?.length || 0} / -${c.downvotes?.length || 0})`);
        });

        // Votes GIVEN by user (What they see in tabs)
        const givenUpvotes = await Post.countDocuments({ upvotes: user._id });
        const givenDownvotes = await Post.countDocuments({ downvotes: user._id });

        console.log(`  SUMMARY:`);
        console.log(`    Calculated Karma: ${postKarma + commentKarma} (Posts: ${postKarma} + Comments: ${commentKarma})`);
        console.log(`    Votes GIVEN by User: Up: ${givenUpvotes}, Down: ${givenDownvotes}`);
    }

    await mongoose.disconnect();
}

debugKarma().catch(console.error);
