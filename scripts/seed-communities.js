
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Simple Mongoose connection for seeding
const uri = 'mongodb://127.0.0.1:27017/reddit_clone_2';

// Define Community Schema inline to avoid module issues in standalone script
const CommunitySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    title: { type: String },
    description: { type: String },
    creator: { type: mongoose.Schema.Types.ObjectId, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId }],
    banner: { type: String },
    icon: { type: String },
    themeColor: { type: String },
    rules: [{ title: String, description: String }],
    createdAt: { type: Date, default: Date.now },
});

const Community = mongoose.models.Community || mongoose.model('Community', CommunitySchema);

// Need a user ID to be the creator. Fetch the first user found.
const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seed() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const user = await User.findOne();
        if (!user) {
            console.log('No users found. Please sign up in the app first!');
            process.exit(1);
        }
        console.log(`Using user: ${user.username} (${user._id}) as creator`);

        const communities = [
            {
                name: 'AlexandriaEgy',
                title: 'ALEXANDRIA, EGYPT',
                description: 'r/AlexandriaEgy is a subreddit for the city of Alexandria, Egypt and its residents, visitors and admirers. Whether you want to share your photos, stories, news, events, questions or tips about this ancient and beautiful city.',
                creator: user._id,
                members: [user._id],
                themeColor: '#0079D3',
                // Using placeholder images or generic colors if no external URL
                banner: '',
                icon: '',
                rules: [
                    { title: 'No doxxing', description: 'Do not share personal information' },
                    { title: 'No brigading', description: 'Do not incite harassment' },
                    { title: 'Be civil', description: 'Respect others' }
                ]
            },
            {
                name: 'nextjs',
                title: 'Next.js',
                description: 'The React Framework for the Web',
                creator: user._id,
                members: [user._id],
                themeColor: '#000000',
            },
            {
                name: 'javascript',
                title: 'JavaScript',
                description: 'All about the JavaScript programming language',
                creator: user._id,
                members: [user._id],
                themeColor: '#F7DF1E',
            }
        ];

        for (const data of communities) {
            const exists = await Community.findOne({ name: data.name });
            if (exists) {
                console.log(`Community r/${data.name} already exists. Skipping.`);
                // Optional: Update it?
                // await Community.updateOne({ _id: exists._id }, data);
            } else {
                await Community.create(data);
                console.log(`Created r/${data.name}`);
            }
        }

        console.log('Seeding complete!');
        process.exit(0);

    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();
