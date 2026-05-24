const express = require('express');
const router = express.Router();
const User = require('../database/models/users');
const { verifyToken } = require('../middleware/authMiddleware');
const { uploadProfileImage, uploadCredential } = require('../middleware/upload');

// =========================================
//    POST /api/upload/profile-image

router.post('/profile-image', verifyToken, (req, res, next) => {
    uploadProfileImage.single('profileImage')(req, res, (err) => {
        if (err) return res.status(400).json({ message: err.message });
        next();
    });
}, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId,
            { $set: { profileImage: req.file.path } },
            { returnDocument: 'after' }
        ).select('-password');

        res.status(200).json({
            message: 'Profile image uploaded successfully',
            profileImage: req.file.path,
            user: updatedUser
        });
    } catch (error) {
        console.error('Profile image upload error:', error);
        res.status(500).json({ message: error.message });
    }
});

// =========================================
//    POST /api/upload/credential

router.post('/credential', verifyToken, (req, res, next) => {
    uploadCredential.single('credential')(req, res, (err) => {
        if (err) return res.status(400).json({ message: err.message });
        next();
    });
}, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId,
            { $set: { credentialDocument: req.file.path } },
            { returnDocument: 'after' }
        ).select('-password');

        res.status(200).json({
            message: 'Credential uploaded successfully',
            credentialDocument: req.file.path,
            user: updatedUser
        });
    } catch (error) {
        console.error('Credential upload error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;