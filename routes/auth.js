const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../database/models/users'); // Path to your users model

/* =========================================================================
   SIGNUP ROUTE (POST /api/auth/signup)
========================================================================= */
router.post('/signup', async (req, res) => {
    try {
        const { 
            role, email, password, username, anonymousName, 
            userPhone, race, struggles, firstName, lastName, 
            phone, qualification, licenseNumber, institutionName, 
            specialization, location, termsAccepted 
        } = req.body;

        // 1. Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                message: 'An account with this email already exists.' 
            });
        }

        // 2. Create a new user instance
        // Mongoose pre('validate') hook will automatically check required fields based on the role
        const newUser = new User({
            role,
            email,
            password, // Passed raw; userSchema pre('save') hook will automatically hash this
            termsAccepted,
            // User-specific fields (default to undefined or empty if not provided)
            username: role === 'user' ? username : undefined,
            anonymousName: role === 'user' ? anonymousName : undefined,
            userPhone: role === 'user' ? userPhone : undefined,
            race: role === 'user' ? race : undefined,
            struggles: role === 'user' ? struggles : [],
            // Therapist-specific fields
            firstName: role === 'therapist' ? firstName : undefined,
            lastName: role === 'therapist' ? lastName : undefined,
            phone: role === 'therapist' ? phone : undefined,
            qualification: role === 'therapist' ? qualification : undefined,
            licenseNumber: role === 'therapist' ? licenseNumber : undefined,
            institutionName: role === 'therapist' ? institutionName : undefined,
            specialization: role === 'therapist' ? specialization : undefined,
            location: role === 'therapist' ? location : undefined
        });

        // 3. Save user to database (Triggers validation & password hashing hooks)
        await newUser.save();

        // 4. Return success response
        res.status(201).json({ 
            message: 'Account created successfully!' 
        });

    } catch (error) {
        console.error('Signup Route Error:', error);
        
        // Handle Mongoose validation errors gracefully instead of generic 500
        if (error.name === 'ValidationError' || error.message.includes('required')) {
            return res.status(400).json({ message: error.message });
        }
        
        res.status(500).json({ 
            message: 'Internal server error during signup.' 
        });
    }
});

/* =========================================================================
   LOGIN ROUTE (POST /api/auth/login)
========================================================================= */
router.post('/login', async (req, res) => {
    try {
        const { role, email, password } = req.body;

        // 1. Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ 
                message: 'Invalid login credentials.' 
            });
        }

        // 2. Verify selected portal role matches database profile role
        if (user.role !== role) {
            return res.status(400).json({ 
                message: 'Invalid login credentials for this role.' 
            });
        }

        // 3. Compare hashed password using the schema method we added
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ 
                message: 'Invalid login credentials.' 
            });
        }

        // 4. Generate JWT Token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' } // Token expires in 24 hours
        );

        // 5. Respond with token and key user data required by login.js localstorage
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                role: user.role,
                anonymousName: user.anonymousName || ''
            }
        });

    } catch (error) {
        console.error('Login Route Error:', error);
        res.status(500).json({ 
            message: 'Internal server error during login.' 
        });
    }
});

module.exports = router;