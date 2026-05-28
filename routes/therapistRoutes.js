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

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> ce02a37 (new features)
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

<<<<<<< HEAD
=======
>>>>>>> 98ea0a3 (sprint 2)
=======
>>>>>>> ce02a37 (new features)
module.exports = router; 