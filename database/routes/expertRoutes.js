const express = require('express');
const router = express.Router();
const expertController = require('../controllers/expertController');

// This makes the endpoint: GET /api/experts/near-me?lat=...&lng=...
router.get('/near-me', expertController.getExpertsNearMe);

module.exports = router;