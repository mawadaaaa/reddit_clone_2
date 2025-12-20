const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env.local');
    process.exit(1);
}

const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
});

const CommunitySchema = new mongoose.Schema({
    name: String,
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Community = mongoose.models.Community || mongoose.model('Community', CommunitySchema);

async function debugMembers() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Get Raw Community
        const rawCommunity = await Community.findOne({ name: 'memes' });
        if (!rawCommunity) {
            console.log('r/memes not found!');
            return;
        }

        console.log(`\n--- r/memes Raw Data ---`);
        console.log(`Members Array Length: ${rawCommunity.members.length}`);
        console.log(`Members IDs:`, rawCommunity.members);

        // 2. Populate
        const populatedCommunity = await Community.findOne({ name: 'memes' }).populate('members', 'username');
        console.log(`\n--- Populated Members ---`);
        populatedCommunity.members.forEach((m, i) => {
            if (m) console.log(`${i + 1}. ${m.username} (ID: ${m._id})`);
            else console.log(`${i + 1}. NULL (Failed to populate)`);
        });

        // 3. List All Users
        console.log(`\n--- All Users in DB ---`);
        const allUsers = await User.find({});
        allUsers.forEach((u, i) => {
            console.log(`${i + 1}. ${u.username} (ID: ${u._id})`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected');
    }
}

debugMembers();
