const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
    createReport,
    getMyReports,
    getReports,
    getAllReports,
    updateReportStatus
} = require('../controllers/reportController');

// ── User or Therapist: submit a report ──
router.post('/', verifyToken, createReport);

// ── Therapist: get their own clinical reports (sidebar) ──
router.get('/my', verifyToken, getMyReports);

// ── Admin: get ALL reports (clinical + moderation) ──
router.get('/all', verifyToken, getAllReports);

// ── General: role-based fetch ──
router.get('/', verifyToken, getReports);

// ── Admin: update status + optional post delete ──
router.patch('/:id/status', verifyToken, updateReportStatus);

module.exports = router;