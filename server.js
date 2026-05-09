require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./database/models/users');
const Post = require('./database/models/Post');
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON data from the frontend

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB successfully!'))
  .catch((err) => console.error('MongoDB connection error:', err));


//  1. SIGNUP ROUTE
// ==========================================
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { role, isAnonymous, identifier, password } = req.body;

        const existingUser = await User.findOne({ identifier });
        if (existingUser) {
            return res.status(400).json({ message: 'This identifier is already taken.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            role,
            isAnonymous,
            identifier,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: 'Account created successfully!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during signup.' });
    }
});


// 2. LOGIN ROUTE
// ==========================================
app.post('/api/auth/login', async (req, res) => {
    try {
        const { role, identifier, password } = req.body;

        const user = await User.findOne({ identifier });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        if (user.role !== role) {
            return res.status(400).json({ message: 'Role mismatch.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );

        res.status(200).json({ 
            message: 'Logged in successfully',
            token,
            user: { identifier: user.identifier, role: user.role }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});


// Middleware to verify if a user is logged in
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};


// 3. POSTS ROUTES (Feed, Create, Like, Comment)
// ==========================================

// GET ALL POSTS
app.get('/api/posts', verifyToken, async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching posts.' });
    }
});

// CREATE A NEW POST
app.post('/api/posts', verifyToken, async (req, res) => {
    try {
        const { postType, content } = req.body;
        const user = await User.findById(req.user.userId);

        const newPost = new Post({
            authorId: user._id,
            authorIdentifier: user.identifier,
            postType,
            content,
            likes: [], // Initialize empty
            comments: [] // Initialize empty
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while creating post.' });
    }
});

// ✅TOGGLE LIKE ON A POST
app.post('/api/posts/:id/like', verifyToken, async (req, res) => {
    try {
        const postId = req.params.id;
        // Get the user from the token (verifyToken middleware provides req.user)
        const user = await User.findById(req.user.userId);
        const userIdentifier = user.identifier;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        // Initialize arrays if they don't exist
        if (!post.likes) post.likes = [];

        const likeIndex = post.likes.indexOf(userIdentifier);
        if (likeIndex === -1) {
            post.likes.push(userIdentifier);
        } else {
            post.likes.splice(likeIndex, 1);
        }
        
        await post.save();
        res.json({ likesCount: post.likes.length, isLiked: likeIndex === -1 });
    } catch (error) {
        console.error("Like Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

//  ADD A COMMENT TO A POST
app.post('/api/posts/:id/comment', verifyToken, async (req, res) => {
    try {
        const postId = req.params.id;
        const { text } = req.body;
        const user = await User.findById(req.user.userId);

        if (!text) return res.status(400).json({ message: 'Comment text is required' });

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (!post.comments) post.comments = [];

        const newComment = { 
            userIdentifier: user.identifier, 
            text: text 
        };

        post.comments.push(newComment);
        await post.save();

        res.json({ 
            comment: post.comments[post.comments.length - 1], 
            commentsCount: post.comments.length 
        });
    } catch (error) {
        console.error("Comment Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ✅ DELETE A POST
app.delete('/api/posts/:id', verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        // Only allow the author to delete
        if (post.authorId.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

//  DELETE A COMMENT
app.delete('/api/posts/:postId/comments/:commentId', verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const comment = post.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        // Verify user owns the comment (assuming you store userIdentifier or authorId in comments)
        const user = await User.findById(req.user.userId);
        if (comment.userIdentifier !== user.identifier) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        comment.remove();
        await post.save();
        res.json({ message: 'Comment deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

//  GET PROFILE DATA
app.get('/api/user/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        const postCount = await Post.countDocuments({ authorId: user._id });
        
        res.json({
            identifier: user.identifier,
            createdAt: user.createdAt,
            postCount: postCount,
            // You can add logic for groupsJoined or sessionsDone here later
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});