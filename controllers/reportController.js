const Report = require('../database/models/Report');
const User = require('../database/models/users');

// ==========================================
// CREATE REPORT (therapist submits)
// ==========================================
const createReport = async (req, res) => {
    try {
        const { category, description } = req.body;

        if (!category || !description) {
            return res.status(400).json({ message: 'Category and description are required' });
        }

        const therapist = await User.findById(req.user.userId).select('firstName lastName');
        if (!therapist) return res.status(404).json({ message: 'Therapist not found' });

        const report = new Report({
            therapistId: req.user.userId,
            therapistName: `${therapist.firstName} ${therapist.lastName}`,
            category,
            description
        });

        await report.save();

        return res.status(201).json({ message: 'Report submitted successfully', report });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ==========================================
// GET MY REPORTS (therapist sees own reports)
// ==========================================
const getMyReports = async (req, res) => {
    try {
        const reports = await Report.find({
            therapistId: req.user.userId
        }).sort({ createdAt: -1 });

        return res.status(200).json({ reports });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ==========================================
// GET ALL REPORTS (admin only)
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
// UPDATE REPORT STATUS (admin only)
// ==========================================
const updateReportStatus = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access only' });
        }

        const { status, adminNote } = req.body;

        if (!['pending', 'reviewed', 'resolved'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const report = await Report.findByIdAndUpdate(
            req.params.id,
            { $set: { status, adminNote: adminNote || '' } },
            { new: true }
        );

        if (!report) return res.status(404).json({ message: 'Report not found' });

        return res.status(200).json({ message: `Report marked as ${status}`, report });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createReport,
    getMyReports,
    getAllReports,
    updateReportStatus
};