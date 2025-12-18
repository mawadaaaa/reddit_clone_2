
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const uri = 'mongodb://127.0.0.1:27017/reddit_clone_2';

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: String,
    createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedUser() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const existing = await User.findOne({ email: 'admin@example.com' });
        if (existing) {
            console.log('User admin@example.com already exists.');
        } else {
            const hashedPassword = await bcrypt.hash('password123', 10);
            await User.create({
                username: 'admin',
                email: 'admin@example.com',
                password: hashedPassword,
                image: '',
            });
            console.log('Created user: admin / password123');
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

seedUser();
