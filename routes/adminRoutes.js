const express = require('express');
const router = express.Router();
const User = require('../database/models/users');
const AuditLog = require('../database/models/AuditLog');
const { verifyToken } = require('../middleware/authMiddleware');
const { recordAuditLog } = require('../utils/auditLogger');
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
        req.adminUser = user;
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
//    GET /api/admin/users
//    Fetch all app accounts across every role
router.get('/users', verifyToken, adminOnly, async (req, res) => {
    try {
        const users = await User.find({})
            .select('-password')
            .sort({ createdAt: -1 });

        await recordAuditLog(req, {
            actor: req.adminUser,
            action: 'Viewed all user accounts',
            metadata: { count: users.length }
        });

        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// =========================================
//    PATCH /api/admin/users/:id/suspend
//    Suspend or reactivate an account
router.patch('/users/:id/suspend', verifyToken, adminOnly, async (req, res) => {
    try {
        const { suspended } = req.body;
        const shouldSuspend = suspended !== false;

        if (String(req.adminUser._id) === String(req.params.id) && shouldSuspend) {
            return res.status(400).json({ message: 'You cannot suspend your own admin account.' });
        }

        const update = shouldSuspend
            ? {
                accountStatus: 'suspended',
                suspendedAt: new Date(),
                suspendedBy: req.adminUser._id
            }
            : {
                accountStatus: 'active',
                $unset: { suspendedAt: '', suspendedBy: '' }
            };

        const user = await User.findByIdAndUpdate(
            req.params.id,
            update,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await recordAuditLog(req, {
            actor: req.adminUser,
            action: shouldSuspend ? 'Suspended account' : 'Reactivated account',
            targetUser: user
        });

        res.status(200).json({
            message: shouldSuspend ? 'Account suspended successfully' : 'Account reactivated successfully',
            user
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// =========================================
//    DELETE /api/admin/users/:id
//    Delete an account from the platform
router.delete('/users/:id', verifyToken, adminOnly, async (req, res) => {
    try {
        if (String(req.adminUser._id) === String(req.params.id)) {
            return res.status(400).json({ message: 'You cannot delete your own admin account.' });
        }

        const user = await User.findByIdAndDelete(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await recordAuditLog(req, {
            actor: req.adminUser,
            action: 'Deleted account',
            targetEmail: user.email,
            metadata: { role: user.role, deletedUserId: String(user._id) }
        });

        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// =========================================
//    GET /api/admin/audit-logs
//    Real audit trail for admin profile
router.get('/audit-logs', verifyToken, adminOnly, async (req, res) => {
    try {
        const logs = await AuditLog.find({})
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();

        res.status(200).json(logs.map(log => ({
            id: log._id,
            timestamp: log.createdAt ? new Date(log.createdAt).toLocaleString() : '',
            action: log.targetEmail ? `${log.action}: ${log.targetEmail}` : log.action,
            ip: log.ip || 'unknown',
            actorRole: log.actorRole,
            actorEmail: log.actorEmail,
            userAgent: log.userAgent
        })));
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
        await recordAuditLog(req, {
            actor: req.adminUser,
            action: 'Approved therapist verification',
            targetUser: therapist
        });

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
        await recordAuditLog(req, {
            actor: req.adminUser,
            action: 'Denied therapist verification',
            targetUser: therapist,
            metadata: { reason: req.body?.reason || '' }
        });

        res.status(200).json({ message: 'Therapist denied and notified' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
module.exports = router;
