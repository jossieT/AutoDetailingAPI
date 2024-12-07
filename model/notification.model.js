const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    message: { type: String, required: true },
    type: { 
        type: String, 
        enum: ['email', 'sms', 'push'], 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['Sent', 'Failed'], 
        default: 'Sent' 
    },
    createdAt: { type: Date, default: Date.now },
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;