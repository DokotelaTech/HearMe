const express = require('express');
const router = express.Router();
const Relief = require('../database/models/Relief');
const User = require('../database/models/users');
const { verifyToken } = require('../middleware/authMiddleware');

// GET all resources (users and therapists can see)
router.get('/', verifyToken, async (req, res) => {
    try {
        const resources = await Relief.find().sort({ createdAt: -1 });
        res.status(200).json({ resources });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET only this therapist's resources
router.get('/mine', verifyToken, async (req, res) => {
    try {
        const resources = await Relief.find({
            therapistId: req.user.userId
        }).sort({ createdAt: -1 });
        res.status(200).json({ resources });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST create new resource
router.post('/', verifyToken, async (req, res) => {
    try {
        const { title, description, link, category, image } = req.body;

        if (!title || !description || !link || !category) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const therapist = await User.findById(req.user.userId).select('firstName lastName');
        if (!therapist) return res.status(404).json({ message: 'Therapist not found' });

        const therapistName = `${therapist.firstName} ${therapist.lastName}`;

        const resource = new Relief({
            therapistId: req.user.userId,
            therapistName,
            title,
            description,
            link,
            category,
            image: image || ''
        });

        await resource.save();
        res.status(201).json({ message: 'Resource published', resource });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE resource (only therapist who created it)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const resource = await Relief.findOneAndDelete({
            _id: req.params.id,
            therapistId: req.user.userId
        });

        if (!resource) return res.status(404).json({ message: 'Resource not found' });

        res.status(200).json({ message: 'Resource deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;