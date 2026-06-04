const User = require("../database/models/users");
const Review = require("../database/models/Review");

// ==========================================
// 1. GET LOGGED-IN THERAPIST PROFILE
// ==========================================
const getTherapistProfile = async (req, res) => {
    try {
        const therapist = await User.findById(req.user.userId).select("-password");

        if (!therapist) {
            return res.status(404).json({ message: "Therapist not found" });
        }

        return res.status(200).json(therapist);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ==========================================
// 2. UPDATE THERAPIST PROFILE
// ==========================================
const updateTherapistProfile = async (req, res) => {
    try {
        const updatedTherapist = await User.findByIdAndUpdate(
            req.user.userId,
            { $set: req.body },
            { new: true, runValidators: false }
        ).select("-password");

        if (!updatedTherapist) {
            return res.status(404).json({ message: "Therapist not found" });
        }

        res.status(200).json(updatedTherapist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================================
// 3. GET THERAPIST CLIENTS
// ==========================================
const getTherapistClients = async (req, res) => {
    try {
        const clients = [];
        return res.status(200).json({ clients });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ==========================================
// 4. GET LOGGED-IN THERAPIST REVIEWS
// ==========================================
const getTherapistReviews = async (req, res) => {
    try {
        const therapist = await User.findById(req.user.userId).select('role');

        if (!therapist || therapist.role !== 'therapist') {
            return res.status(403).json({ message: 'Only therapists can view therapist reviews' });
        }

        const reviews = await Review.find({ therapistId: req.user.userId })
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({ reviews });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTherapistProfile,
    updateTherapistProfile,
    getTherapistClients,
    getTherapistReviews
};
