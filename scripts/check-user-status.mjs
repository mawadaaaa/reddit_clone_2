import mongoose from 'mongoose';
import User from '../models/User.js';

// Use environment variable or fallback to local
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/reddit_clone_2';

async function checkUsers() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({}, 'username email');
        console.log(`Found ${users.length} users:`);
        users.forEach(u => console.log(`- ${u.username} (${u.email})`));

        await mongoose.disconnect();
    } catch (error) {
        console.error('User Check Error:', error);
        process.exit(1);
    }
}

checkUsers();
