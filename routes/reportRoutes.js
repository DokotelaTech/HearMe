const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
    createReport,
    getMyReports,
    getAllReports,
    updateReportStatus
} = require('../controllers/reportController');

// Therapist: submit a report
router.post('/', verifyToken, createReport);

// Therapist: get their own reports
router.get('/my', verifyToken, getMyReports);

// Admin: get all reports
router.get('/all', verifyToken, getAllReports);

// Admin: update report status
router.patch('/:id/status', verifyToken, updateReportStatus);

module.exports = router;