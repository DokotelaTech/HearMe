const express = require('express');
const router = express.Router();
<<<<<<< HEAD
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
=======
const User = require('../database/models/users'); 

// Fetching user profile
router.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password'); // Exclude password
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Fetch Profile Error:', error);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
});

module.exports = router;
>>>>>>> e9da0a9 (therapists)
