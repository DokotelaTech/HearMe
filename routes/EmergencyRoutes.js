// ============================================================
//  routes/emergencyRoutes.js
//  Already mounted in server.js as:
//  app.use('/api/emergency', require('./routes/emergencyRoutes'));
// ============================================================

const express    = require('express');
const router     = express.Router();
const jwt        = require('jsonwebtoken');
const { triggerSOS, notifySessionStarted } = require('../controllers/emergencyController');

// ── Inline verifyToken (mirrors the one in server.js) ────────
// We use this so the route works independently without importing from server.js
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });
    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

// POST /api/emergency/sos
// Client triggers SOS → all verified therapists get emailed
router.post('/sos', verifyToken, triggerSOS);

// POST /api/emergency/session-started
// Therapist starts a call → client + therapist both get emailed
// Body: { clientId: "<mongo user _id>" }
router.post('/session-started', verifyToken, notifySessionStarted);

module.exports = router;