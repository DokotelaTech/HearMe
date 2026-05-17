// database/models/Post.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    userIdentifier: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// 2. Define the Main Post Schema
/*const postSchema = new mongoose.Schema({
    // Who created the post?
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorIdentifier: { type: String, required: true }, // e.g., "User#8472"
    
    // What kind of post is it?
    postType: { type: String, enum: ['struggle', 'success'], required: true },
    
    // The actual text
    content: { type: String, required: true },
    
    // For when we add the image upload feature later
    imageUrl: { type: String, default: '' }, 
    
    // Likes: Changed to String to easily store the userIdentifier from the frontend
    // This allows us to check if "User#1234" is already in the array to prevent double-liking
    likes: [{ type: String }],
    
    // Comments: Attached the schema we built above
    comments: [commentSchema]
    
}, { timestamps: true }); // Automatically adds createdAt and updatedAt dates
*/
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