const mongoose = require('mongoose');
const Community = require('../models/Community');

// Hardcoded from known .env.local value for verification
const MONGODB_URI = 'mongodb://127.0.0.1:27017/reddit_clone_2';

async function checkDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const communities = await Community.find({}, 'name');
        console.log(`Found ${communities.length} communities:`);
        communities.forEach(c => console.log(`- ${c.name}`));

        mongoose.disconnect();
    } catch (error) {
        console.error('DB Check Error:', error);
        process.exit(1);
    }
}

checkDB();
