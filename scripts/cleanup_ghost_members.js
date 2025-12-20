const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env.local');
    process.exit(1);
}

const UserSchema = new mongoose.Schema({
    username: String,
});

const CommunitySchema = new mongoose.Schema({
    name: String,
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Community = mongoose.models.Community || mongoose.model('Community', CommunitySchema);

async function cleanupGhosts() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Get all valid User IDs
        const users = await User.find({}, '_id');
        const userIds = new Set(users.map(u => u._id.toString()));
        console.log(`Found ${userIds.size} valid users.`);

        // 2. Iterate Communities
        const communities = await Community.find({});
        console.log(`Scanning ${communities.length} communities...`);

        for (const community of communities) {
            const originalCount = community.members.length;

            // Filter members: Keep only those whose ID exists in the User set
            const validMembers = community.members.filter(memberId => {
                return userIds.has(memberId.toString());
            });

            if (validMembers.length < originalCount) {
                const removedCount = originalCount - validMembers.length;
                console.log(`[FIX] r/${community.name}: Removing ${removedCount} ghost member(s). (${originalCount} -> ${validMembers.length})`);

                community.members = validMembers;
                await community.save();
                console.log(`   -> Saved r/${community.name}`);
            } else {
                console.log(`[OK] r/${community.name}: No ghosts.`);
            }
        }

        console.log('Cleanup complete.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
}

cleanupGhosts();
