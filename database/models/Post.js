// database/models/Post.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    // Who created the post?
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorIdentifier: { type: String, required: true }, // e.g., "User#8472"
    
    // What kind of post is it?
    postType: { type: String, enum: ['struggle', 'success'], required: true },
    
    // The actual text
    content: { type: String, required: true },
    
    // For when we add the image upload feature later
    imageUrl: { type: String, default: '' }, 
    
    // Likes: An array of User IDs so we know exactly WHO liked it (prevents double-liking)
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    
    // Comments: An array of comment objects
    comments: [{
        text: { type: String, required: true },
        authorIdentifier: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true }); // Automatically adds a createdAt date (e.g., "2 hours ago")

module.exports = mongoose.model('Post', postSchema);