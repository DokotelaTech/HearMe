const Report = require('../database/models/Report');
const User = require('../database/models/users');
const Post = require('../database/models/Post');

// ==========================================
// CREATE REPORT
// Works for both users (moderation) and therapists (clinical)
// ==========================================
const createReport = async (req, res) => {
    try {
        const { category, description, postId, type } = req.body;

        if (!category || !type) {
            return res.status(400).json({ message: 'Category and type are required' });
        }

        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // ── CLINICAL (therapist reporting an issue to admin) ──
        if (type === 'clinical') {
            const reporterName = user.firstName
                ? `${user.firstName} ${user.lastName}`
                : user.anonymousName || user.username || user.email;

            const report = new Report({
                type,
                reporterId: req.user.userId,
                reporterName,
                category,
                description: description || ''
            });

            await report.save();
            return res.status(201).json({ message: 'Report submitted successfully', report });
        }

        // ── MODERATION (user reporting a community post) ──
        if (type === 'moderation') {
            if (!postId) {
                return res.status(400).json({ message: 'postId is required for moderation reports' });
            }

            const post = await Post.findById(postId);
            if (!post) return res.status(404).json({ message: 'Post not found' });

            // Prevent duplicate reports from the same user on the same post
            const existing = await Report.findOne({ postId, reporterId: req.user.userId });
            if (existing) {
                return res.status(400).json({ message: 'You have already reported this post' });
            }

            const report = new Report({
                type,
                reporterId: req.user.userId,
                postId,
                postContent: post.content,
                postAuthor: post.authorIdentifier || 'Unknown',
                category,
                description: description || ''
            });

            await report.save();
            return res.status(201).json({ message: 'Post reported successfully' });
        }

        return res.status(400).json({ message: 'Invalid report type. Use clinical or moderation' });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ==========================================
// GET MY REPORTS
// Therapist sees their own clinical reports
// ==========================================
const getMyReports = async (req, res) => {
    try {
        const reports = await Report.find({
            reporterId: req.user.userId,
            type: 'clinical'
        }).sort({ createdAt: -1 });

        return res.status(200).json({ reports });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ==========================================
// GET ALL REPORTS (admin only)
// Returns both clinical and moderation reports
// ==========================================
const getAllReports = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access only' });
        }

        const reports = await Report.find()
            .sort({ createdAt: -1 });

        return res.status(200).json({ reports });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ==========================================
// GET REPORTS (role-based)
// ==========================================
const getReports = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'therapist') {
            query = { reporterId: req.user.userId, type: 'clinical' };
        } else if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const reports = await Report.find(query).sort({ createdAt: -1 });
        return res.status(200).json({ reports });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ==========================================
// UPDATE REPORT STATUS (admin only)
// Can also delete the reported post
// ==========================================
const updateReportStatus = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access only' });
        }

        const { status, adminNote, action } = req.body;

        if (!['pending', 'reviewed', 'resolved', 'dismissed', 'deleted'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const report = await Report.findById(req.params.id);
        if (!report) return res.status(404).json({ message: 'Report not found' });

        // If admin chooses to delete the reported post
        if (action === 'deletePost' && report.postId) {
            await Post.findByIdAndDelete(report.postId);
        }

        const updated = await Report.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    status,
                    adminNote: adminNote || '',
                    resolvedAt: ['resolved', 'dismissed', 'deleted'].includes(status)
                        ? new Date()
                        : undefined
                }
            },
            { new: true }
        );

        return res.status(200).json({ message: `Report marked as ${status}`, report: updated });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Keep old updateReport as alias so nothing breaks
const updateReport = updateReportStatus;

module.exports = {
    createReport,
    getMyReports,
    getReports,
    getAllReports,
    updateReportStatus,
    updateReport
};