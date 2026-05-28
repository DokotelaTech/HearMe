const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { createReport, getReports, dismissReport, deleteReportedPost } = require('../controllers/reportController');

router.get('/', authMiddleware, getReports);
router.post('/', authMiddleware, createReport);
router.post('/:id/dismiss', authMiddleware, dismissReport);
router.delete('/:id/delete-post', authMiddleware, deleteReportedPost);

module.exports = router;