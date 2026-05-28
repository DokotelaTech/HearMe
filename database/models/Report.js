const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({

    // Who submitted
    therapistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    therapistName: {
        type: String,
        required: true
    },

    // What they're reporting
    category: {
        type: String,
        enum: ['technical', 'client', 'safety'],
        required: true
    },

    description: {
        type: String,
        required: true,
        trim: true
    },

    // Admin tracking
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'resolved'],
        default: 'pending'
    },

    adminNote: {
        type: String,
        trim: true
    }

}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);