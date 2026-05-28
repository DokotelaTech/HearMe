const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    postContent: { type: String },
    postAuthor: { type: String },
    reporterIdentifier: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, default: '' },
    status: { type: String, default: 'pending' }, // pending, dismissed, deleted
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);