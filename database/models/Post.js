// database/models/Post.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userIdentifier: { type: String, required: true },
    userProfileImage: { type: String, default: '' },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const reportSchema = new mongoose.Schema({
    reporterIdentifier: { type: String, required: true },
    reason: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    authorIdentifier: { type: String, required: true },
    authorProfileImage: { type: String, default: '' },
    postType: { type: String, required: true },
    content: { type: String, default: '' },
    gifUrl: { type: String, trim: true },
    likes: [{ type: String }], // Array of strings (identifiers)
    comments: [commentSchema], // Array of comment objects
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);
