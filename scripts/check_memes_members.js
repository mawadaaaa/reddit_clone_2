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

async function checkMembers() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const community = await Community.findOne({ name: 'memes' }).populate('members', 'username');

        if (!community) {
            console.log('Community r/memes not found');
        } else {
            console.log(`Found community: r/${community.name}`);
            console.log(`Member count: ${community.members.length}`);
            console.log('Members:');
            community.members.forEach((member, index) => {
                // member might be null if user was deleted but id remained
                if (member) {
                    console.log(`${index + 1}. ${member.username}`);
                } else {
                    console.log(`${index + 1}. [Deleted User]`);
                }
            });
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
}

checkMembers();
