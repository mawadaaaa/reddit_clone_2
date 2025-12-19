const mongoose = require('mongoose');

// Must load env vars manually if not using Next.js runtime
// Copying URI from seed.js as we are running this as a standalone script
const MONGODB_URI = 'mongodb+srv://mawada:3AcloApEh4AvLP6B@cluster0.kfgxowi.mongodb.net/reddit_clone?retryWrites=true&w=majority&appName=Cluster0';

if (!MONGODB_URI) {
    console.error('Please define MONGODB_URI');
    process.exit(1);
}

// Schemas (Redefining here to avoid ES6 module issues in node script)
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const PostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    image: { type: String },
    video: { type: String },
    createdAt: { type: Date, default: Date.now },
});
const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);

const CommentSchema = new mongoose.Schema({
    content: { type: String, required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    createdAt: { type: Date, default: Date.now },
});
const Comment = mongoose.models.Comment || mongoose.model('Comment', CommentSchema);

const RANDOM_COMMENTS = [
    "This is such a great post!",
    "I totally agree with this.",
    "Can you explain more?",
    "This is the way.",
    "lol",
    "Underrated opinion.",
    "Thanks for sharing!",
    "I was just thinking about this yesterday.",
    "Interesting perspective.",
    "Does this works on Windows?",
    "Finally someone said it.",
    "Big if true."
];

const RANDOM_REPLIES = [
    "Exactly!",
    "No, I don't think so.",
    "Valid point.",
    "Same here.",
    "Check the documentation.",
    "Why?",
    "+1"
];

async function seedComments() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const users = await User.find({});
        const posts = await Post.find({});

        if (users.length === 0 || posts.length === 0) {
            console.log('No users or posts found. Run seed.js first.');
            process.exit(1);
        }

        console.log(`Found ${users.length} users and ${posts.length} posts.`);

        let commentCount = 0;
        let replyCount = 0;

        for (const post of posts) {
            // Add 1-4 random comments per post
            const numComments = Math.floor(Math.random() * 4) + 1;

            for (let i = 0; i < numComments; i++) {
                const randomUser = users[Math.floor(Math.random() * users.length)];
                const randomContent = RANDOM_COMMENTS[Math.floor(Math.random() * RANDOM_COMMENTS.length)];

                const newComment = await Comment.create({
                    content: randomContent,
                    post: post._id,
                    author: randomUser._id,
                    parentComment: null
                });
                commentCount++;

                // 50% chance to add a reply
                if (Math.random() > 0.5) {
                    const randomReplyUser = users[Math.floor(Math.random() * users.length)];
                    const randomReplyContent = RANDOM_REPLIES[Math.floor(Math.random() * RANDOM_REPLIES.length)];

                    await Comment.create({
                        content: randomReplyContent,
                        post: post._id,
                        author: randomReplyUser._id,
                        parentComment: newComment._id
                    });
                    replyCount++;
                }
            }
        }

        console.log(`Successfully added ${commentCount} comments and ${replyCount} replies.`);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding comments:', error);
        process.exit(1);
    }
}

seedComments();
