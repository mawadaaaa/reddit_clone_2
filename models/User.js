import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please provide a username'],
        unique: true,
        maxlength: [20, 'Username cannot be more than 20 characters'],
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
    },
    image: {
        type: String,
        default: '',
    },
    displayName: {
        type: String,
        maxlength: [30, 'Display Name cannot be more than 30 characters'],
        default: '',
    },
    banner: {
        type: String,
        default: '',
    },
    about: {
        type: String,
        maxlength: [500, 'About cannot be more than 500 characters'],
        default: '',
    },
    saved: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }],
    hidden: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }],
    recentInteractions: [{
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post'
        },
        interactedAt: {
            type: Date,
            default: Date.now
        },
        type: {
            type: String,
            enum: ['view', 'create'],
            default: 'view'
        }
    }],
    customFeeds: [{
        name: { type: String, required: true },
        communities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Community' }]
    }],
    favoriteCommunities: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community'
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
