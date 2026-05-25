// database/models/Post.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    userIdentifier: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});


const postSchema = new mongoose.Schema({
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    authorIdentifier: { type: String, required: true },
    postType: { type: String, required: true },
    content: { type: String, required: true },
    likes: [{ type: String }], // Array of strings (identifiers)
    comments: [commentSchema], // Array of comment objects
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);