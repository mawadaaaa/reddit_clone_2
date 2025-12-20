import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['post_reply', 'comment_reply', 'post_upvote', 'post_downvote', 'comment_upvote', 'comment_downvote'],
        required: true,
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
    },
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
    },
    read: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Force recompilation in dev to pick up enum changes
if (process.env.NODE_ENV === 'development' && mongoose.models.Notification) {
    delete mongoose.models.Notification;
}

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
