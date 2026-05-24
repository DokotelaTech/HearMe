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

        fs.readFile(path.join(__dirname, '../admin/admin.html'), 'utf8', (err, res)=>{
            if(err){
                res.status(400).json({err:"could not load the page"})
            }else{
                
                res.sendFile(path.join(__dirname, '../admin/admin.html'))
            }
            
        })
        const therapist = await User.findByIdAndUpdate(
            req.params.id,
            { $set: { profileStatus: 'verified' } },
            { returnDocument: 'after' }
        );

        if (!therapist) return res.status(404).json({ message: 'Therapist not found' });

        // Send approval email
        await transporter.sendMail({
            from: `"HearMe" <${process.env.EMAIL_USER}>`,
            to: therapist.email,
            subject: 'Your HearMe Profile Has Been Approved!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4CAF50;">Congratulations, ${therapist.firstName}!</h2>
                    <p>Your therapist profile on <strong>HearMe</strong> has been reviewed and <strong>approved</strong>.</p>
                    <p>You can now log in and start connecting with users who need your support.</p>
                    <a href="${process.env.FRONTEND_URL}/login" 
                       style="background:#4CAF50;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:16px;">
                        Go to HearMe
                    </a>
                    <p style="margin-top: 24px; color: #888;">The HearMe Team</p>
                </div>
            `
        });

        res.status(200).json({ message: 'Therapist approved and notified via email' });
    } catch (error) {
        console.error('Approve error:', error);
        res.status(500).json({ message: error.message });
    }
});

// =========================================
//    POST /api/admin/deny/:id
router.post('/approve/:id', verifyToken, adminOnly, async (req, res) => {
    try {
        const therapist = await User.findByIdAndUpdate(
            req.params.id,
            { $set: { profileStatus: 'verified' } },
            { returnDocument: 'after' }
        );

        if (!therapist) return res.status(404).json({ message: 'Therapist not found' });

        await transporter.sendMail({
            from: `"HearMe" <${process.env.EMAIL_USER}>`,
            to: therapist.email,
            subject: 'Your HearMe Profile Has Been Approved!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4CAF50;">Congratulations, ${therapist.firstName}!</h2>
                    <p>Your therapist profile on <strong>HearMe</strong> has been reviewed and <strong>approved</strong>.</p>
                    <p>You can now log in and start connecting with users who need your support.</p>
                    <a href="${process.env.FRONTEND_URL}/login" 
                       style="background:#4CAF50;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:16px;">
                        Go to HearMe
                    </a>
                    <p style="margin-top: 24px; color: #888;">The HearMe Team</p>
                </div>
            `
        });

        res.status(200).json({ message: 'Therapist approved and notified via email' });
    } catch (error) {
        console.error('Approve error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;