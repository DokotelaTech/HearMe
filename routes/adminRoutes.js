const express = require('express');
const router = express.Router();
const User = require('../database/models/users');
const { verifyToken } = require('../middleware/authMiddleware');
const nodemailer = require('nodemailer');
const fs = require('fs')
const path = require('path')
// =========================================
//    EMAIL TRANSPORTER
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// =========================================
//    MIDDLEWARE: Admin only
const adminOnly = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// =========================================
//    GET /api/admin/pending-therapists
//    Fetch all therapists pending review
router.get('/pending-therapists', verifyToken, adminOnly, async (req, res) => {
    try {
        const therapists = await User.find({
            role: 'therapist',
            profileStatus: 'verifying'
        }).select('-password');

        res.status(200).json({ therapists });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// =========================================
//    GET /api/admin/metrics
//    Dashboard stats
router.get('/metrics', verifyToken, adminOnly, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const verifiedWorkers = await User.countDocuments({ role: 'therapist', profileStatus: 'verified' });
        const pendingReview = await User.countDocuments({ role: 'therapist', profileStatus: 'verifying' });

        res.status(200).json({ totalUsers, verifiedWorkers, pendingReview });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// =========================================
//    POST /api/admin/approve/:id
router.post('/approve/:id', verifyToken, adminOnly, async (req, res) => {
    try {
        const therapist = await User.findByIdAndUpdate(
            req.params.id,
            { $set: { profileStatus: 'verified' } },
            { returnDocument: 'after' }
        );

        if (!therapist) return res.status(404).json({ message: 'Therapist not found' });

        // await transporter.sendMail({ ... });

        res.status(200).json({ message: 'Therapist approved and notified via email' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// =========================================
//    POST /api/admin/deny/:id
router.post('/deny/:id', verifyToken, adminOnly, async (req, res) => {
    try {
        const therapist = await User.findByIdAndUpdate(
            req.params.id,
            { $set: { profileStatus: 'incomplete' } },
            { returnDocument: 'after' }
        );

        if (!therapist) return res.status(404).json({ message: 'Therapist not found' });

        await transporter.sendMail({
            // ← different email content for denial
        });

        res.status(200).json({ message: 'Therapist denied and notified' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
module.exports = router;