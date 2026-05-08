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


//  SIGNUP ROUTE
// ==========================================
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { role, isAnonymous, identifier, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ identifier });
        if (existingUser) {
            return res.status(400).json({ message: 'This identifier is already taken.' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user in the database
        const newUser = new User({
            role,
            isAnonymous,
            identifier,
            password: hashedPassword
        });

        await newUser.save(); // saving to MongoDB

        res.status(201).json({ message: 'Account created successfully!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during signup.' });
    }
});


// 2. LOGIN ROUTE
app.post('/api/auth/login', async (req, res) => {
    try {
        const { role, identifier, password } = req.body;

        // Find user by identifier
        const user = await User.findOne({ identifier });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // Verify they are logging into the correct role 
        if (user.role !== role) {
            return res.status(400).json({ message: 'Role mismatch.' });
        }

        // Compare the submitted password with the hashed database password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // Generate a JWT Token
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

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


// Middleware to verify if a user is logged in
const verifyToken = (req, res, next) => {
   
    const token = req.header('Authorization');
    
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        // Verify the token using your secret key
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = decoded; // Attach the user's ID and role to the request
        next(); // Let them through to the route
    } catch (error) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};


//  GET ALL POSTS (For the Feed)
// ==========================================
app.get('/api/posts', verifyToken, async (req, res) => {
    try {
        // Fetch all posts, sorted by newest first
        const posts = await Post.find().sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching posts.' });
    }
});


//  CREATE A NEW POST
// ==========================================
app.post('/api/posts', verifyToken, async (req, res) => {
    try {
        const { postType, content } = req.body;

        // Fetch the user's identifier from the database using the ID inside their token
        const user = await User.findById(req.user.userId);

        const newPost = new Post({
            authorId: user._id,
            authorIdentifier: user.identifier,
            postType,
            content
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while creating post.' });
    }
});