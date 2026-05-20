const express = require('express');
const router = express.Router();
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