const express = require("express");
const router = express.Router();
const User = require('../database/models/users');
const { verifyToken } = require("../middleware/authMiddleware");

const {
    getTherapistProfile,
    getTherapistClients
} = require("../controllers/therapistController");

router.get("/profile", verifyToken, getTherapistProfile);
router.get("/clients", verifyToken, getTherapistClients);


// POST /api/therapist/submit-for-review
router.post('/submit-for-review', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);

        if (!user || user.role !== 'therapist') {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Make sure they have uploaded required details
        if (!user.profileImage || !user.credentialDocument) {
            return res.status(400).json({ message: 'Please upload your profile image and credential document before submitting' });
        }

        user.profileStatus = 'verifying';
        await user.save();

        res.status(200).json({ message: 'Submitted for review successfully' });
    } catch (error) {
        console.error('Submit for review error:', error);
        res.status(500).json({ message: error.message });
    }
});

const Availability = require('../database/models/Availability');

// GET /api/therapist/availability
router.get('/availability', verifyToken, async (req, res) => {
    try {
        const availability = await Availability.findOne({ therapistId: req.user.userId });

        if (!availability) {
            return res.status(200).json({
                schedule: [
                    { day: 'Monday',    start: '09:00', end: '17:00', active: true },
                    { day: 'Tuesday',   start: '09:00', end: '17:00', active: true },
                    { day: 'Wednesday', start: '09:00', end: '17:00', active: true },
                    { day: 'Thursday',  start: '09:00', end: '17:00', active: true },
                    { day: 'Friday',    start: '09:00', end: '17:00', active: true },
                    { day: 'Saturday',  start: '10:00', end: '14:00', active: false },
                    { day: 'Sunday',    start: '',      end: '',      active: false }
                ]
            });
        }

        res.status(200).json({ schedule: availability.schedule });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/therapist/availability
router.post('/availability', verifyToken, async (req, res) => {
    try {
        const { schedule } = req.body;

        if (!schedule || !Array.isArray(schedule)) {
            return res.status(400).json({ message: 'Invalid schedule data' });
        }

        const availability = await Availability.findOneAndUpdate(
            { therapistId: req.user.userId },
            { therapistId: req.user.userId, schedule },
            { upsert: true, new: true }
        );

        res.status(200).json({
            message: 'Availability saved successfully',
            schedule: availability.schedule
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// get all verified therapists
router.get('/verified', verifyToken, async (req, res) => {
    try {
        const therapists = await User.find({
            role: 'therapist',
            profileStatus: 'verified'
        }).select('-password');

        res.status(200).json({ therapists });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 