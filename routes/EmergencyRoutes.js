// ============================================================
//  routes/emergencyRoutes.js
// ============================================================

const express    = require('express');
const router     = express.Router();
const verifyToken = require('../middleware/verifyToken'); // adjust path if different
const { triggerSOS, notifySessionStarted } = require('../controllers/emergencyController');

// POST /api/emergency/sos
// Client triggers emergency SOS → all therapists get emailed
router.post('/sos', verifyToken, triggerSOS);

// POST /api/emergency/session-started
// Therapist starts a call → client + therapist both get emailed
// Body: { clientId: "<mongo user id>" }
router.post('/session-started', verifyToken, notifySessionStarted);

module.exports = router;