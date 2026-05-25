const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema({
    text:           { type: String, required: true },
    therapist_name: { type: String, default: 'Your Therapist' },
    sent_at:        { type: Date,   default: Date.now }
});

const MessageSchema = new mongoose.Schema({
    expert_name:  { type: String, required: true },
    sender_name:  { type: String, required: true },
    message:      { type: String, required: true },
    is_read:      { type: Boolean, default: false },
    sent_at:      { type: Date,   default: Date.now },
    replies:      [ReplySchema]          // ← therapist replies live here
});

module.exports = mongoose.model('Message', MessageSchema);