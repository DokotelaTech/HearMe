require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require("crypto");
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

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(
            token.replace('Bearer ', ''),
            process.env.JWT_SECRET
        );
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

// =========================================
// ROUTE FILES
// =========================================
const therapistRoutes = require('./routes/therapistRoutes');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messageRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const reportRoutes = require('./routes/reportRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reliefRoutes = require('./routes/reliefRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const groupRoutes = require('./routes/groupRoutes');


app.use('/api/payments', paymentRoutes);
app.use('/api/relief', reliefRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/therapist', therapistRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reports', reportRoutes);

app.get('/api/config/giphy', verifyToken, (req, res) => {
    res.json({ apiKey: process.env.GIPHY_API_KEY?.trim() || '' });
});

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
app.get('/therapist/groups', (req, res) => {
    res.sendFile(path.join(__dirname, 'Therapistportal', 'pages', 'groups.html'));
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

// ========================================
// payment server
app.get('/payment/success', (req, res) => {
    res.sendFile(path.join(__dirname, 'user-profiles', 'payment-success.html'));
});

app.get('/payment/cancel', (req, res) => {
    res.sendFile(path.join(__dirname, 'user-profiles', 'payment-cancel.html'));
});


// admin dashboard
app.get('/admin/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'admins.html'));
});

app.get('/admin/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
});
 
app.get('/admin/reports', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'reports.html'));
});
 
app.get('/admin/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'adminProfile.html'));
});
 

// =========================================
// MODELS
// =========================================
const User = require('./database/models/users');
const Post = require('./database/models/Post');

// =========================================
// POSTS ROUTES
// =========================================
app.get('/api/posts', verifyToken, async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('authorId', 'profileImage')
            .populate('comments.userId', 'profileImage')
            .sort({ createdAt: -1 })
            .lean();

        const hydratedPosts = posts.map(post => ({
            ...post,
            authorProfileImage: post.authorId?.profileImage || post.authorProfileImage || '',
            authorId: post.authorId?._id || post.authorId,
            comments: (post.comments || []).map(comment => ({
                ...comment,
                userProfileImage: comment.userId?.profileImage || comment.userProfileImage || '',
                userId: comment.userId?._id || comment.userId
            }))
        }));

        res.status(200).json(hydratedPosts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching posts.' });
    }
});

app.post('/api/posts', verifyToken, async (req, res) => {
    try {
        const { postType, content, gifUrl } = req.body;
        if (!String(content || '').trim() && !String(gifUrl || '').trim()) {
            return res.status(400).json({ message: 'Post text or GIF is required' });
        }

        const user = await User.findById(req.user.userId);
        const displayName = user.anonymousName || user.username || user.email;

        const newPost = new Post({
            authorId: user._id,
            authorIdentifier: displayName,
            authorProfileImage: user.profileImage || '',
            postType,
            content: String(content || '').trim(),
            gifUrl: String(gifUrl || '').trim(),
            likes: [],
            comments: []
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while creating post.' });
    }
});

app.post('/api/posts/:id/like', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        const userIdentifier = user.anonymousName || user.username || user.email;
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ message: 'Post not found' });

        post.likes = post.likes || [];
        const likeIndex = post.likes.indexOf(userIdentifier);

        if (likeIndex === -1) {
            post.likes.push(userIdentifier);
        } else {
            post.likes.splice(likeIndex, 1);
        }

        await post.save();
        res.json({ likesCount: post.likes.length, isLiked: likeIndex === -1 });
    } catch (error) {
        console.error('Like Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/posts/:id/comment', verifyToken, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ message: 'Comment text is required' });

        const user = await User.findById(req.user.userId);
        const userIdentifier = user.anonymousName || user.username || user.email;
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ message: 'Post not found' });

        post.comments = post.comments || [];
        post.comments.push({
            userId: user._id,
            userIdentifier,
            userProfileImage: user.profileImage || '',
            text
        });
        await post.save();

        res.json({
            comment: post.comments[post.comments.length - 1],
            commentsCount: post.comments.length
        });
    } catch (error) {
        console.error('Comment Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/posts/:id', verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (!post.authorId || post.authorId.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/posts/:postId/comments/:commentId', verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const commentIndex = post.comments.findIndex(
            c => c._id.toString() === req.params.commentId
        );

        if (commentIndex === -1) return res.status(404).json({ message: 'Comment not found' });

        const comment = post.comments[commentIndex];
        const user = await User.findById(req.user.userId);
        const userIdentifier = user.anonymousName || user.username || user.email;

        const ownsCommentById = comment.userId && comment.userId.toString() === req.user.userId;
        const ownsCommentByName = comment.userIdentifier === userIdentifier;

        if (!ownsCommentById && !ownsCommentByName) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        post.comments.splice(commentIndex, 1);
        await post.save();
        res.json({ message: 'Comment deleted' });
    } catch (error) {
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
            profileImage: user.profileImage || '',
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
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
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
    .then(() => {
        console.log('Connected to MongoDB successfully!');
        startReminderJob();
    })
    .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
