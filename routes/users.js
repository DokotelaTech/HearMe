const express = require('express');
const router = express.Router();
const User = require('../database/models/users');

const { verifyToken } = require('../middleware/authMiddleware');

const {
    getTherapistProfile,
    updateTherapistProfile,
    getTherapistClients
} = require('../controllers/therapistController');

router.get('/profile', verifyToken, getTherapistProfile);
router.put('/update', verifyToken, updateTherapistProfile);
router.get('/clients', verifyToken, getTherapistClients);

router.get('/:id', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user by ID", error: error.message });
    }
});

module.exports = router; 