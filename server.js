require('dotenv').config();
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
<<<<<<< HEAD
const app = express();
const { startReminderJob } = require('./utils/reminderJob');

app.use(cors());
app.use(express.json());
app.use('/therapist', express.static(path.join(__dirname, 'Therapistportal')));

// =========================================
// VERIFY TOKEN MIDDLEWARE
// =========================================
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');

=======
=======

>>>>>>> e9da0a9 (therapists)
=======
const path = require('path');
>>>>>>> 98ea0a3 (sprint 2)
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');

=======
>>>>>>> ce02a37 (new features)
const app = express();

app.use(cors());
app.use(express.json());
app.use('/therapist', express.static(path.join(__dirname, 'Therapistportal')));

// =========================================
// VERIFY TOKEN MIDDLEWARE
// =========================================
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(
            token.replace('Bearer ', ''),
            process.env.JWT_SECRET
        );
<<<<<<< HEAD

<<<<<<< HEAD
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
>>>>>>> 8bfd832 (project)
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
<<<<<<< HEAD
        const decoded = jwt.verify(
            token.replace('Bearer ', ''),
            process.env.JWT_SECRET
        );
=======
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
>>>>>>> 8bfd832 (project)
=======
>>>>>>> e9da0a9 (therapists)
=======
>>>>>>> 98ea0a3 (sprint 2)
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
// =========================================
// ROUTE FILES
// =========================================
<<<<<<< HEAD
const therapistRoutes = require('./routes/therapistRoutes');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messageRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const reportRoutes = require('./routes/reportRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reliefRoutes = require('./routes/reliefRoutes');

app.use('/api/relief', reliefRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/therapist', therapistRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reports', reportRoutes);

// =========================================
// STATIC FILES & CLEAN URLs
// =========================================
app.use(express.static(path.join(__dirname, 'landing-page')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));
app.use('/user', express.static(path.join(__dirname, 'user-profiles')));
app.use('/therapist', express.static(path.join(__dirname, 'Therapistportal')));

// Admin routes
app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'adminLogin.html'));
});
app.get('/admin/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'admins.html'));
});

// Auth routes
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'landing-page', 'login.html'));
});
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'landing-page', 'signup.html'));
});

// Therapist routes
app.get('/therapist/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'Therapistportal', 'pages', 'profiles.html'));
});
app.get('/therapist/calendar', (req, res) => {
    res.sendFile(path.join(__dirname, 'Therapistportal', 'pages', 'calendar.html'));
});
app.get('/therapist/clients', (req, res) => {
    res.sendFile(path.join(__dirname, 'Therapistportal', 'pages', 'client.html'));
});
app.get('/therapist/messages', (req, res) => {
    res.sendFile(path.join(__dirname, 'Therapistportal', 'pages', 'message.html'));
});
app.get('/therapist/reliefs', (req, res) => {
    res.sendFile(path.join(__dirname, 'Therapistportal', 'pages', 'reliefs.html'));
});
app.get('/therapist/report', (req, res) => {
    res.sendFile(path.join(__dirname, 'Therapistportal', 'pages', 'report.html'));
});

// User routes
app.get('/user/community', (req, res) => {
    res.sendFile(path.join(__dirname, 'user-profiles', 'community-feeds.html'));
});
app.get('/user/groups', (req, res) => {
    res.sendFile(path.join(__dirname, 'user-profiles', 'groups.html'));
});
app.get('/user/chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'user-profiles', 'ai-chat.html'));
});
app.get('/user/experts', (req, res) => {
    res.sendFile(path.join(__dirname, 'user-profiles', 'experts.html'));
});
app.get('/user/messages', (req, res) => {
    res.sendFile(path.join(__dirname, 'user-profiles', 'messages.html'));
});
app.get('/user/sos', (req, res) => {
    res.sendFile(path.join(__dirname, 'user-profiles', 'SOS.html'));
});
app.get('/user/relief', (req, res) => {
    res.sendFile(path.join(__dirname, 'user-profiles', 'relief.html'));
});
app.get('/user/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'user-profiles', 'profile.html'));
});

// =========================================
// MODELS
// =========================================
const User = require('./database/models/users');
const Post = require('./database/models/Post');

// =========================================
// POSTS ROUTES
// =========================================
=======
=======
/* =========================================
   POSTS ROUTES
========================================= */
>>>>>>> e9da0a9 (therapists)
=======
// =========================================
// ROUTE FILES
>>>>>>> 98ea0a3 (sprint 2)

=======
>>>>>>> ce02a37 (new features)
const therapistRoutes = require('./routes/therapistRoutes');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messageRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const reportRoutes = require('./routes/reportRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reliefRoutes = require('./routes/reliefRoutes');

app.use('/api/relief', reliefRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/therapist', therapistRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reports', reportRoutes);

// =========================================
// STATIC FILES & CLEAN URLs
// =========================================
app.use(express.static(path.join(__dirname, 'landing-page')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));
app.use('/user', express.static(path.join(__dirname, 'user-profiles')));
app.use('/therapist', express.static(path.join(__dirname, 'Therapistportal')));

// Admin routes
app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'adminLogin.html'));
});
app.get('/admin/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'admins.html'));
});

// Auth routes
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'landing-page', 'login.html'));
});
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'landing-page', 'signup.html'));
});

// Therapist routes
app.get('/therapist/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'Therapistportal', 'pages', 'profiles.html'));
});
app.get('/therapist/calendar', (req, res) => {
    res.sendFile(path.join(__dirname, 'Therapistportal', 'pages', 'calendar.html'));
});
app.get('/therapist/clients', (req, res) => {
    res.sendFile(path.join(__dirname, 'Therapistportal', 'pages', 'client.html'));
});
app.get('/therapist/messages', (req, res) => {
    res.sendFile(path.join(__dirname, 'Therapistportal', 'pages', 'message.html'));
});
app.get('/therapist/reliefs', (req, res) => {
    res.sendFile(path.join(__dirname, 'Therapistportal', 'pages', 'reliefs.html'));
});
app.get('/therapist/report', (req, res) => {
    res.sendFile(path.join(__dirname, 'Therapistportal', 'pages', 'report.html'));
});

// User routes
app.get('/user/community', (req, res) => {
    res.sendFile(path.join(__dirname, 'user-profiles', 'community-feeds.html'));
});
app.get('/user/groups', (req, res) => {
    res.sendFile(path.join(__dirname, 'user-profiles', 'groups.html'));
});
app.get('/user/chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'user-profiles', 'ai-chat.html'));
});
app.get('/user/experts', (req, res) => {
    res.sendFile(path.join(__dirname, 'user-profiles', 'experts.html'));
});
app.get('/user/messages', (req, res) => {
    res.sendFile(path.join(__dirname, 'user-profiles', 'messages.html'));
});
app.get('/user/sos', (req, res) => {
    res.sendFile(path.join(__dirname, 'user-profiles', 'SOS.html'));
});
app.get('/user/relief', (req, res) => {
    res.sendFile(path.join(__dirname, 'user-profiles', 'relief.html'));
});
app.get('/user/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'user-profiles', 'profile.html'));
});

// =========================================
// MODELS
// =========================================
const User = require('./database/models/users');
const Post = require('./database/models/Post');

// =========================================
// POSTS ROUTES
<<<<<<< HEAD

<<<<<<< HEAD
// GET ALL POSTS
>>>>>>> 8bfd832 (project)
=======
>>>>>>> e9da0a9 (therapists)
=======
// =========================================
>>>>>>> ce02a37 (new features)
app.get('/api/posts', verifyToken, async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching posts.' });
    }
});

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
// CREATE A NEW POST
>>>>>>> 8bfd832 (project)
=======
/* CREATE POST */

>>>>>>> e9da0a9 (therapists)
=======
>>>>>>> 98ea0a3 (sprint 2)
app.post('/api/posts', verifyToken, async (req, res) => {
    try {
        const { postType, content } = req.body;
        const user = await User.findById(req.user.userId);
<<<<<<< HEAD
<<<<<<< HEAD
        const displayName = user.anonymousName || user.username || user.email;

        const newPost = new Post({
            authorId: user._id,
            authorIdentifier: displayName,
            postType,
            content,
            likes: [],
            comments: []
=======

        const displayName =
            user.anonymousName ||
            user.username ||
            user.email;
=======
        const displayName = user.anonymousName || user.username || user.email;
>>>>>>> 98ea0a3 (sprint 2)

        const newPost = new Post({
            authorId: user._id,
            authorIdentifier: displayName,
            postType,
            content,
<<<<<<< HEAD
<<<<<<< HEAD
            likes: [], // Initialize empty
            comments: [] // Initialize empty
>>>>>>> 8bfd832 (project)
=======

=======
>>>>>>> 98ea0a3 (sprint 2)
            likes: [],
            comments: []
>>>>>>> e9da0a9 (therapists)
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while creating post.' });
    }
});

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> ce02a37 (new features)
app.post('/api/posts/:id/like', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        const userIdentifier = user.anonymousName || user.username || user.email;
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ message: 'Post not found' });

        post.likes = post.likes || [];
        const likeIndex = post.likes.indexOf(userIdentifier);

=======
// ✅TOGGLE LIKE ON A POST
=======
/* LIKE / UNLIKE POST */
=======
>>>>>>> 98ea0a3 (sprint 2)

>>>>>>> e9da0a9 (therapists)
app.post('/api/posts/:id/like', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        const userIdentifier = user.anonymousName || user.username || user.email;
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ message: 'Post not found' });

        post.likes = post.likes || [];
        const likeIndex = post.likes.indexOf(userIdentifier);

<<<<<<< HEAD
        const likeIndex = post.likes.indexOf(userIdentifier);
>>>>>>> 8bfd832 (project)
=======
>>>>>>> e9da0a9 (therapists)
        if (likeIndex === -1) {
            post.likes.push(userIdentifier);
        } else {
            post.likes.splice(likeIndex, 1);
        }
<<<<<<< HEAD
<<<<<<< HEAD

        await post.save();
        res.json({ likesCount: post.likes.length, isLiked: likeIndex === -1 });
<<<<<<< HEAD
    } catch (error) {
        console.error('Like Error:', error);
=======
        
=======

>>>>>>> e9da0a9 (therapists)
        await post.save();

        res.json({

            likesCount: post.likes.length,

            isLiked: likeIndex === -1
        });

    } catch (error) {
<<<<<<< HEAD
        console.error("Like Error:", error);
>>>>>>> 8bfd832 (project)
        res.status(500).json({ message: 'Server error' });
    }
});

<<<<<<< HEAD
app.post('/api/posts/:id/comment', verifyToken, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ message: 'Comment text is required' });

        const user = await User.findById(req.user.userId);
        const userIdentifier = user.anonymousName || user.username || user.email;
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ message: 'Post not found' });

        post.comments = post.comments || [];
        post.comments.push({ userIdentifier, text });
        await post.save();

        res.json({
            comment: post.comments[post.comments.length - 1],
            commentsCount: post.comments.length
        });
    } catch (error) {
        console.error('Comment Error:', error);
=======
//  ADD A COMMENT TO A POST
=======

=======
    } catch (error) {
>>>>>>> 98ea0a3 (sprint 2)
        console.error('Like Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

<<<<<<< HEAD
/* ADD COMMENT */
>>>>>>> e9da0a9 (therapists)
=======
>>>>>>> 98ea0a3 (sprint 2)
app.post('/api/posts/:id/comment', verifyToken, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ message: 'Comment text is required' });

        const user = await User.findById(req.user.userId);
        const userIdentifier = user.anonymousName || user.username || user.email;
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ message: 'Post not found' });

        post.comments = post.comments || [];
        post.comments.push({ userIdentifier, text });
        await post.save();

        res.json({
            comment: post.comments[post.comments.length - 1],
            commentsCount: post.comments.length
        });
    } catch (error) {
<<<<<<< HEAD
<<<<<<< HEAD
        console.error("Comment Error:", error);
>>>>>>> 8bfd832 (project)
        res.status(500).json({ message: 'Server error' });
    }
});

<<<<<<< HEAD
=======
// ✅ DELETE A POST
>>>>>>> 8bfd832 (project)
app.delete('/api/posts/:id', verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

<<<<<<< HEAD
=======
        // Only allow the author to delete
>>>>>>> 8bfd832 (project)
        if (post.authorId.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized' });
=======

=======
>>>>>>> 98ea0a3 (sprint 2)
        console.error('Comment Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/posts/:id', verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

<<<<<<< HEAD
        if (!post) {

            return res.status(404).json({
                message: 'Post not found'
            });
        }

        if (
            post.authorId.toString() !== req.user.userId
        ) {

            return res.status(403).json({
                message: 'Unauthorized'
            });
>>>>>>> e9da0a9 (therapists)
=======
        if (post.authorId.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized' });
>>>>>>> 98ea0a3 (sprint 2)
        }

        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
//  DELETE A COMMENT
>>>>>>> 8bfd832 (project)
=======
>>>>>>> ce02a37 (new features)
app.delete('/api/posts/:postId/comments/:commentId', verifyToken, async (req, res) => {
=======

<<<<<<< HEAD
/* DELETE COMMENT */
app.delete(
'/api/posts/:postId/comments/:commentId',
verifyToken,

async (req, res) => {

>>>>>>> e9da0a9 (therapists)
=======
app.delete('/api/posts/:postId/comments/:commentId', verifyToken, async (req, res) => {
>>>>>>> 98ea0a3 (sprint 2)
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
        const commentIndex = post.comments.findIndex(
            c => c._id.toString() === req.params.commentId
        );

        if (commentIndex === -1) return res.status(404).json({ message: 'Comment not found' });

        const comment = post.comments[commentIndex];
        const user = await User.findById(req.user.userId);
        const userIdentifier = user.anonymousName || user.username || user.email;

        if (comment.userIdentifier !== userIdentifier) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        post.comments.splice(commentIndex, 1);
        await post.save();
        res.json({ message: 'Comment deleted' });
    } catch (error) {
        console.error(error);
=======
        const comment = post.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });
=======
        const post = await Post.findById(
            req.params.postId
=======
        const commentIndex = post.comments.findIndex(
            c => c._id.toString() === req.params.commentId
>>>>>>> 98ea0a3 (sprint 2)
        );
>>>>>>> e9da0a9 (therapists)

        if (commentIndex === -1) return res.status(404).json({ message: 'Comment not found' });

        const comment = post.comments[commentIndex];
        const user = await User.findById(req.user.userId);
        const userIdentifier = user.anonymousName || user.username || user.email;

        if (comment.userIdentifier !== userIdentifier) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        post.comments.splice(commentIndex, 1);
        await post.save();
<<<<<<< HEAD
<<<<<<< HEAD
        res.json({ message: 'Comment deleted' });
    } catch (error) {
>>>>>>> 8bfd832 (project)
        res.status(500).json({ message: 'Server error' });
    }
});

<<<<<<< HEAD
// =========================================
// USER PROFILE
// =========================================
=======
//  GET PROFILE DATA
>>>>>>> 8bfd832 (project)
app.get('/api/user/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        const postCount = await Post.countDocuments({ authorId: user._id });
<<<<<<< HEAD

        res.json({
            identifier: user.anonymousName || user.username || user.email,
            createdAt: user.createdAt,
            postCount
        });
    } catch (error) {
        console.error(error);
=======
        
=======

>>>>>>> e9da0a9 (therapists)
        res.json({
            message: 'Comment deleted'
        });

    } catch (error) {
<<<<<<< HEAD
>>>>>>> 8bfd832 (project)
        res.status(500).json({ message: 'Server error' });
    }
});

<<<<<<< HEAD
// =========================================
// AI CHAT ROUTE
// =========================================
=======
// AI CHAT ROUTE (Google Gemini API Integration)
>>>>>>> 8bfd832 (project)
app.post('/api/chat', verifyToken, async (req, res) => {
    const userText = req.body.message;
    const API_KEY = process.env.GOOGLE_API_KEY;
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

<<<<<<< HEAD
    const requestBody = {
        contents: [{
            role: 'user',
            parts: [{
                text: `You are HearMe, an anonymous, compassionate AI listener. Your goal is to provide a safe, non-judgmental space for users. Keep responses concise, empathetic, and always end by gently guiding the conversation forward.\n\nUser says: ${userText}`
            }]
        }],
=======
    const systemInstruction = "You are HearMe, an anonymous, compassionate AI listener. Your goal is to provide a safe, non-judgmental space for users. Keep your responses concise, empathetic, and always end by gently guiding the conversation forward or asking how they feel.";

    const requestBody = {
        contents: [{ role: "user", parts: [{ text: `${systemInstruction}\n\nUser says: ${userText}` }] }],
>>>>>>> 8bfd832 (project)
        generationConfig: { temperature: 0.7 }
    };

    try {
<<<<<<< HEAD
=======
        // Note: fetch is natively supported in Node.js 18+. If using an older version, you'll need node-fetch.
>>>>>>> 8bfd832 (project)
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
<<<<<<< HEAD
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('AI Server Error:', error);
        res.status(500).json({ error: 'Failed to communicate with AI API.' });
    }
});

// REPORT A POST
app.post('/api/posts/:id/report', verifyToken, async (req, res) => {
    
    try {
        const { reason } = req.body;
        const user = await User.findById(req.user.userId);
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ message: 'Post not found' });

        // Match the same identifier pattern used across all post routes
        const userIdentifier = user.anonymousName || user.username || user.email;

        // Prevent duplicate reports from same user
        const alreadyReported = post.reports.find(r => r.reporterIdentifier === userIdentifier);
        if (alreadyReported) return res.status(400).json({ message: 'You have already reported this post.' });

        post.reports.push({ reporterIdentifier: userIdentifier, reason });
        await post.save();

        res.json({ message: 'Report submitted successfully' });
    } catch (error) {
        console.error('Report error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// ADMIN - GET ALL REPORTED POSTS
app.get('/api/admin/reports', async (req, res) => {
    try {
        const posts = await Post.find({ 'reports.0': { $exists: true } }).sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ADMIN - DELETE REPORTED POST
app.delete('/api/admin/posts/:id', async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: 'Post deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// sends email
// startReminderJob();

// =========================================
// CONNECT TO MONGODB & START SERVER
// =========================================
mongoose.connect(process.env.MONGODB_URI, { family: 4 })
    .then(() => console.log('Connected to MongoDB successfully!'))
    .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
=======
=======

=======
        res.json({ message: 'Comment deleted' });
    } catch (error) {
>>>>>>> 98ea0a3 (sprint 2)
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// =========================================
// USER PROFILE
// =========================================
app.get('/api/user/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        const postCount = await Post.countDocuments({ authorId: user._id });

        res.json({
            identifier: user.anonymousName || user.username || user.email,
            createdAt: user.createdAt,
            postCount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// =========================================
// AI CHAT ROUTE
// =========================================
app.post('/api/chat', verifyToken, async (req, res) => {
    const userText = req.body.message;
    const API_KEY = process.env.GOOGLE_API_KEY;
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

    const requestBody = {
        contents: [{
            role: 'user',
            parts: [{
                text: `You are HearMe, an anonymous, compassionate AI listener. Your goal is to provide a safe, non-judgmental space for users. Keep responses concise, empathetic, and always end by gently guiding the conversation forward.\n\nUser says: ${userText}`
            }]
        }],
        generationConfig: { temperature: 0.7 }
    };

    try {
<<<<<<< HEAD

        const response = await fetch(
            API_URL,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json'
                },

                body: JSON.stringify(requestBody)
            }
        );
>>>>>>> e9da0a9 (therapists)

        const data = await response.json();

        res.json(data);

    } catch (error) {

        console.error('AI Server Error:', error);

        res.status(500).json({
            error:
                'Failed to communicate with AI API.'
=======
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
>>>>>>> 98ea0a3 (sprint 2)
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('AI Server Error:', error);
        res.status(500).json({ error: 'Failed to communicate with AI API.' });
    }
});


// =========================================
// CONNECT TO MONGODB & START SERVER
// =========================================
mongoose.connect(process.env.MONGODB_URI, { family: 4 })
    .then(() => console.log('Connected to MongoDB successfully!'))
    .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
<<<<<<< HEAD
<<<<<<< HEAD

app.listen(PORT, () => {

    console.log(`Server is running on port ${PORT}`);
<<<<<<< HEAD
});
>>>>>>> 8bfd832 (project)
=======

});
>>>>>>> e9da0a9 (therapists)
=======
app.listen(PORT, () => console.log(`Server is running on  http://localhost:${PORT}`));
>>>>>>> 98ea0a3 (sprint 2)
=======
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
>>>>>>> ce02a37 (new features)
