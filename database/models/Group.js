const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    therapistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 80
    },
    category: {
        type: String,
        required: true,
        trim: true,
        maxlength: 60
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    meetingTime: {
        type: String,
        trim: true,
        maxlength: 120
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    events: [{
        title: { type: String, required: true, trim: true, maxlength: 100 },
        date: { type: String, required: true },
        time: { type: String, required: true },
        notes: { type: String, trim: true, maxlength: 300 },
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);
