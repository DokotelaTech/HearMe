require('dotenv').config();
<<<<<<< HEAD
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
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
app.use(express.json()); 

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    family: 4, 
})
  .then(() => console.log('Connected to MongoDB successfully!'))
  .catch((err) => console.error(' MongoDB connection error:', err));

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
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

<<<<<<< HEAD
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

// 3. POSTS ROUTES (Feed, Create, Like, Comment)
// ==========================================

// GET ALL POSTS
>>>>>>> 8bfd832 (project)
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
=======
// CREATE A NEW POST
>>>>>>> 8bfd832 (project)
app.post('/api/posts', verifyToken, async (req, res) => {
    try {
        const { postType, content } = req.body;
        const user = await User.findById(req.user.userId);
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

        const newPost = new Post({
            authorId: user._id,
            authorIdentifier: user.identifier,
            postType,
            content,
            likes: [], // Initialize empty
            comments: [] // Initialize empty
>>>>>>> 8bfd832 (project)
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while creating post.' });
    }
});

<<<<<<< HEAD
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
>>>>>>> 8bfd832 (project)
        if (likeIndex === -1) {
            post.likes.push(userIdentifier);
        } else {
            post.likes.splice(likeIndex, 1);
        }
<<<<<<< HEAD

        await post.save();
        res.json({ likesCount: post.likes.length, isLiked: likeIndex === -1 });
    } catch (error) {
        console.error('Like Error:', error);
=======
        
        await post.save();
        res.json({ likesCount: post.likes.length, isLiked: likeIndex === -1 });
    } catch (error) {
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
        }

        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

<<<<<<< HEAD
=======
//  DELETE A COMMENT
>>>>>>> 8bfd832 (project)
app.delete('/api/posts/:postId/comments/:commentId', verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

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

        // Verify user owns the comment (assuming you store userIdentifier or authorId in comments)
        const user = await User.findById(req.user.userId);
        if (comment.userIdentifier !== user.identifier) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        comment.remove();
        await post.save();
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
        
        res.json({
            identifier: user.identifier,
            createdAt: user.createdAt,
            postCount: postCount,
            // You can add logic for groupsJoined or sessionsDone here later
        });
    } catch (error) {
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

        const data = await response.json();
        // console.log("Google API Response:", JSON.stringify(data, null, 2));  Google API Response
        res.json(data);
        
    } catch (error) {
        console.error("AI Server Error:", error);
        res.status(500).json({ error: "Failed to communicate with AI API." });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
>>>>>>> 8bfd832 (project)
