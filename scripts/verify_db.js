const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://mawada:3AcloApEh4AvLP6B@cluster0.kfgxowi.mongodb.net/reddit_clone?retryWrites=true&w=majority&appName=Cluster0';

async function check() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const userCount = await mongoose.connection.db.collection('users').countDocuments();
        const communityCount = await mongoose.connection.db.collection('communities').countDocuments();
        const postCount = await mongoose.connection.db.collection('posts').countDocuments();
        const commentCount = await mongoose.connection.db.collection('comments').countDocuments();

        console.log('Users:', userCount);
        console.log('Communities:', communityCount);
        console.log('Posts:', postCount);
        console.log('Comments:', commentCount);

        // List a few posts
        const posts = await mongoose.connection.db.collection('posts').find({}).limit(3).toArray();
        console.log('Sample Posts:', posts);

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

check();
