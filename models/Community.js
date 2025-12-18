import mongoose from 'mongoose';

const CommunitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a community name'],
        unique: true,
        maxlength: [21, 'Name cannot be more than 21 characters'],
    },
    description: {
        type: String,
        default: '',
        maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    banner: {
        type: String,
        default: '',
    },
    icon: {
        type: String,
        default: '',
    },
    themeColor: {
        type: String,
        default: '#0079D3',
    },
    rules: [{
        title: String,
        description: String,
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Community || mongoose.model('Community', CommunitySchema);
