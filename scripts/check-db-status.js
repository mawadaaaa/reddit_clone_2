const mongoose = require('mongoose');
// Inline schema to avoid ESM import issues with models/Community.js
const CommunitySchema = new mongoose.Schema({ name: String }, { strict: false });
const Community = mongoose.models.Community || mongoose.model('Community', CommunitySchema);

// Hardcoded from known .env.local value for verification
const MONGODB_URI = 'mongodb+srv://mawada:3AcloApEh4AvLP6B@cluster0.kfgxowi.mongodb.net/reddit_clone?retryWrites=true&w=majority&appName=Cluster0';

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
