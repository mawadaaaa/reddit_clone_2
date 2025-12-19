const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Must load env vars manually if not using Next.js runtime
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

const CommunitySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
});
const Community = mongoose.models.Community || mongoose.model('Community', CommunitySchema);

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


async function seed() {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');

    // Clear existing
    await User.deleteMany({});
    await Community.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});

    // Create Users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const u1 = await User.create({ username: 'tech_guru', email: 'tech@example.com', password: hashedPassword });
    const u2 = await User.create({ username: 'funny_cat', email: 'cat@example.com', password: hashedPassword });
    const u3 = await User.create({ username: 'news_bot', email: 'news@example.com', password: hashedPassword });

    console.log('Users created');

    // Create Communities
    const c1 = await Community.create({ name: 'javascript', description: 'All things JS', creator: u1._id, members: [u1._id, u2._id] });
    const c2 = await Community.create({ name: 'memes', description: 'Funny stuff', creator: u2._id, members: [u1._id, u2._id, u3._id] });
    const c3 = await Community.create({ name: 'news', description: 'World news', creator: u3._id, members: [u3._id] });

    console.log('Communities created');

    // Create Posts
    const posts = [
        { title: 'Next.js 14 is awesome!', content: 'I really love the new app router features. It makes routing so much easier once you get used to it.', image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60', community: c1._id, author: u1._id, upvotes: [u2._id, u3._id] },
        { title: 'Why did the developer go broke?', content: 'Because he used up all his cache.', community: c2._id, author: u2._id, upvotes: [u1._id, u3._id, u2._id] },
        { title: 'Global Tech Summit 2025 announced', content: 'The biggest tech conference is happening next month in San Francisco.', community: c3._id, author: u3._id, upvotes: [u1._id] },
        { title: 'How to center a div?', content: 'I have been trying for 3 hours. Someone help. I tried flexbox but it is still slightly off. What am I doing wrong?', community: c1._id, author: u2._id, upvotes: [] },
        { title: 'Look at this cat', content: 'Meow meow. Just a cute cat picture.', image: 'https://images.unsplash.com/photo-1529778873920-4da4926a7071?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', community: c2._id, author: u1._id, upvotes: [u2._id] },
        { title: 'Understanding Async/Await in depth', content: 'Here is a deep dive into how promises work under the hood...', community: c1._id, author: u3._id, upvotes: [u1._id] },
        { title: 'When the code works on the first try', content: 'Suspicious. Very suspicious.', community: c2._id, author: u3._id, upvotes: [u1._id, u2._id] },
        { title: 'Market crash imminent?', content: 'Economists predict a downturn in the tech sector next quarter.', community: c3._id, author: u1._id, upvotes: [u2._id] },
        { title: 'Best VS Code Extensions 2025', content: '1. Prettier\n2. ESLint\n3. GitLens\nWhat are your favorites?', community: c1._id, author: u1._id, upvotes: [u2._id, u3._id] },
        { title: 'Breaking: Mars colony creates first internet node', content: 'Interplanetary internet is now officially a reality.', video: 'https://www.w3schools.com/html/mov_bbb.mp4', community: c3._id, author: u2._id, upvotes: [u1._id, u3._id] },
        { title: 'Imagine a place where you can just be... calm.', content: 'Nature is amazing. We should all touch grass more often.', image: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&auto=format&fit=crop&q=60', community: c2._id, author: u3._id, upvotes: [u1._id, u2._id] },
        { title: 'Cyberpunk City Vibes', content: 'Neon lights and rain. My favorite aesthetic.', image: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=60', community: c2._id, author: u1._id, upvotes: [u3._id] },
        { title: 'The minimal setup', content: 'Clean desk, clean mind.', image: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=800&auto=format&fit=crop&q=60', community: c1._id, author: u2._id, upvotes: [u1._id, u3._id] }
    ];

    const createdPosts = await Post.create(posts);

    console.log('Posts created');

    // Create Comments
    const comments = [
        { content: 'This is actually really cool!', post: createdPosts[0]._id, author: u2._id },
        { content: 'I agree, the routing is much better.', post: createdPosts[0]._id, author: u3._id },
        { content: 'Haha, classic cache joke.', post: createdPosts[1]._id, author: u3._id },
        { content: 'Try using margin: 0 auto;', post: createdPosts[3]._id, author: u1._id },
        { content: 'Or use flexbox: justify-content: center;', post: createdPosts[3]._id, author: u3._id },
        { content: 'Cute cat!', post: createdPosts[4]._id, author: u2._id },

        // Comments for top posts (latest)
        { content: 'I have been saying this for years!', post: createdPosts[9]._id, author: u1._id }, // Mars post
        { content: 'This is scary but expected.', post: createdPosts[7]._id, author: u2._id }, // Market crash (index 7 or 8 depending on order)
        { content: 'VIM is all you need.', post: createdPosts[8]._id, author: u3._id }, // VS Code
        { content: 'Async await simplifies so much.', post: createdPosts[5]._id, author: u2._id }, // Async
        { content: 'Undefined is not a function :(', post: createdPosts[6]._id, author: u1._id }, // Code works first try
        { content: 'Finally some good news.', post: createdPosts[2]._id, author: u2._id }, // Tech summit
        { content: 'Buy low sell high!', post: createdPosts[7]._id, author: u3._id },
    ];

    const createdComments = await Comment.create(comments);

    // Create Nested Replies
    const replies = [
        { content: 'This is a reply to the first comment!', post: createdPosts[0]._id, author: u1._id, parentComment: createdComments[0]._id },
        { content: 'And this is a nested reply.', post: createdPosts[0]._id, author: u3._id, parentComment: createdComments[0]._id },
        { content: 'Replying to the cache joke...', post: createdPosts[1]._id, author: u1._id, parentComment: createdComments[2]._id },
        { content: 'Nested reply level 2', post: createdPosts[1]._id, author: u2._id, parentComment: createdComments[2]._id }, // Ideally this would point to the reply above, but for simplicity just another reply to root
    ];

    // Actually, to make a level 2 reply, we need the ID of the reply we just created.
    // Let's just do one level of nesting for now to prove it works.

    await Comment.create(replies);
    console.log('Comments and Replies created');

    console.log('Done!');
    process.exit(0);
}

seed();
