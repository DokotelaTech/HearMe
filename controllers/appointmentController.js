const Appointment = require('../database/models/Appointment');
const User = require('../database/models/users');
const Review = require('../database/models/Review');

// ==========================================
// GET ALL APPOINTMENTS FOR LOGGED-IN USER
// ==========================================
const getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({
            userId: req.user.userId
        }).sort({ date: 1, time: 1 });

        return res.status(200).json({ appointments });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ==========================================
// GET MY APPOINTMENTS (user profile page)
// Shows pending + approved — not denied/cancelled/completed
// ==========================================
const getMyAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({
            userId: req.user.userId,
            status: { $in: ['pending', 'approved', 'cancelled'] }
        }).sort({ date: 1, time: 1 });

        return res.status(200).json({ appointments });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ==========================================
// GET THERAPIST'S APPOINTMENTS
// ==========================================
const getTherapistAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({
            therapistId: req.user.userId
        }).sort({ isEmergency: -1, createdAt: -1, date: 1, time: 1 });

        return res.status(200).json({ appointments });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ==========================================
// CREATE APPOINTMENT
// ==========================================
const createAppointment = async (req, res) => {
    try {
        const { therapistId, date, time, type, note } = req.body;

        if (!therapistId || !date || !time) {
            return res.status(400).json({ message: 'therapistId, date, and time are required' });
        }

        const therapist = await User.findById(therapistId).select('firstName lastName');
        if (!therapist) return res.status(404).json({ message: 'Therapist not found' });

        const client = await User.findById(req.user.userId).select('username anonymousName email');
        const clientName = client.anonymousName || client.username || client.email || 'Anonymous';

        const appointment = new Appointment({
            userId: req.user.userId,
            therapistId,
            therapistName: `${therapist.firstName} ${therapist.lastName}`,
            clientName,
            date,
            time,
            type: type || 'online',
            note: note || '',
            status: 'pending'
        });

        await appointment.save();
        return res.status(201).json({ message: 'Appointment booked', appointment });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ==========================================
// THERAPIST: APPROVE OR DENY APPOINTMENT
// ==========================================
const updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['approved', 'denied'].includes(status)) {
            return res.status(400).json({ message: 'Status must be approved or denied' });
        }

        const appointment = await Appointment.findOneAndUpdate(
            { _id: req.params.id, therapistId: req.user.userId },
            { $set: { status, ...(status === 'approved' ? { emergencyAcceptedAt: new Date() } : {}) } },
            { new: true }
        );

        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        if (appointment.isEmergency && status === 'approved' && appointment.emergencyGroupId) {
            await Appointment.updateMany(
                {
                    _id: { $ne: appointment._id },
                    emergencyGroupId: appointment.emergencyGroupId,
                    status: 'pending'
                },
                { $set: { status: 'accepted_by_other' } }
            );
        }

        return res.status(200).json({ message: `Appointment ${status}`, appointment });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ==========================================
// USER: SUBMIT REVIEW AFTER SESSION
// ==========================================
const createAppointmentReview = async (req, res) => {
    try {
        const { rating, review } = req.body;
        const parsedRating = Number(rating);

        if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
            return res.status(400).json({ message: 'Rating must be a whole number between 1 and 5' });
        }

        if (review && String(review).length > 500) {
            return res.status(400).json({ message: 'Review must be 500 characters or fewer' });
        }

        const appointment = await Appointment.findOne({
            _id: req.params.id,
            userId: req.user.userId,
            status: { $in: ['approved', 'completed'] }
        });

        if (!appointment) {
            return res.status(404).json({ message: 'Reviewable appointment not found' });
        }

        const client = await User.findById(req.user.userId).select('anonymousName username email');
        const userName = client?.anonymousName || client?.username || client?.email || 'Anonymous User';

        const savedReview = await Review.findOneAndUpdate(
            { appointmentId: appointment._id },
            {
                appointmentId: appointment._id,
                therapistId: appointment.therapistId,
                userId: appointment.userId,
                userName,
                rating: parsedRating,
                review: String(review || '').trim()
            },
            { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
        );

        if (appointment.status !== 'completed') {
            appointment.status = 'completed';
            await appointment.save();
        }

        return res.status(201).json({ message: 'Review submitted', review: savedReview });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ==========================================
// USER: CANCEL APPOINTMENT
// Sets status to 'cancelled' — does NOT delete
// ==========================================
const cancelAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            { $set: { status: 'cancelled' } },
            { new: true }
        );

        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        return res.status(200).json({ message: 'Appointment cancelled', appointment });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ==========================================
// UPDATE APPOINTMENT (general)
// ==========================================
const updateAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            { $set: req.body },
            { new: true }
        );

        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        return res.status(200).json({ message: 'Appointment updated', appointment });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ==========================================
// DELETE APPOINTMENT
// ==========================================
const deleteAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        return res.status(200).json({ message: 'Appointment deleted' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAppointments,
    getMyAppointments,
    getTherapistAppointments,
    createAppointment,
    updateAppointmentStatus,
    cancelAppointment,
    updateAppointment,
    deleteAppointment,
    createAppointmentReview
};
