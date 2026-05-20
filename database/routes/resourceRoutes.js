const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const Resource = require('../models/Resource');
const User = require('../models/users');

/* =========================
   VERIFY TOKEN MIDDLEWARE
========================= */
const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({
            message: 'Access denied. No token provided.'
        });
    }

    try {
        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token error:', error);
        return res.status(400).json({
            message: 'Invalid token.'
        });
    }
};

/* =========================
   GET ALL RESOURCES
========================= */
router.get('/', verifyToken, async (req, res) => {
    try {
        const resources = await Resource.find().sort({ createdAt: -1 });
        res.json(resources);
    } catch (error) {
        console.error('Load resources error:', error);
        res.status(500).json({
            message: 'Server error while fetching resources.'
        });
    }
});

/* =========================
   CREATE RESOURCE
========================= */
router.post('/', verifyToken, async (req, res) => {
    try {
        const { title, description, link, category, image } = req.body;

        if (!title || !description || !link || !category) {
            return res.status(400).json({
                message: 'Please fill in all required fields.'
            });
        }

        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found.'
            });
        }

        const newResource = new Resource({
            title,
            description,
            link,
            category,
            image: image || '',
            createdBy: {
                userId: user._id,
                identifier: user.identifier,
                role: user.role
            }
        });

        await newResource.save();

        res.status(201).json({
            message: 'Resource published successfully!',
            resource: newResource
        });
    } catch (error) {
        console.error('Create resource error:', error);
        res.status(500).json({
            message: 'Server error while creating resource.'
        });
    }
});

module.exports = router;