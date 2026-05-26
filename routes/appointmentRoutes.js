const express = require('express');
const router = express.Router();
const Appointment = require('../database/models/Appointment');
const User = require('../database/models/users');
const { verifyToken } = require('../middleware/authMiddleware');

// =========================================
// DAILY.CO ROOM CREATOR
// =========================================
async function createDailyRoom(appointmentId) {
    const response = await fetch('https://api.daily.co/v1/rooms', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.DAILY_API_KEY}`
        },
        body: JSON.stringify({
            name: `hearme-${appointmentId}`,
            properties: {
                enable_chat: true,
                enable_screenshare: false,
                max_participants: 2,
                exp: Math.round(Date.now() / 1000) + 60 * 60 * 2
            }
        })
    });
    return await response.json();
}

// =========================================
// POST /api/appointments — user books
// =========================================
router.post('/', verifyToken, async (req, res) => {
    try {
        const { therapistId, date, time, type, note } = req.body;

        if (!therapistId || !date || !time) {
            return res.status(400).json({ message: 'Therapist, date and time are required' });
        }

        const user = await User.findById(req.user.userId);
        const therapist = await User.findById(therapistId);
        if (!therapist) return res.status(404).json({ message: 'Therapist not found' });

        const appointment = new Appointment({
            userId: req.user.userId,
            therapistId,
            therapistName: `${therapist.firstName} ${therapist.lastName}`,
            clientName: user.anonymousName || user.username || user.email,
            date,
            time,
            type: type || 'online',
            note,
            status: 'pending'
        });

        await appointment.save();
        res.status(201).json({ message: 'Appointment booked successfully', appointment });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// =========================================
// GET /api/appointments/my — user's appointments
// =========================================
router.get('/my', verifyToken, async (req, res) => {
    try {
        const appointments = await Appointment.find({
            userId: req.user.userId
        }).sort({ date: 1, time: 1 });

        res.status(200).json({ appointments });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// =========================================
// GET /api/appointments/therapist
// =========================================
router.get('/therapist', verifyToken, async (req, res) => {
    try {
        const appointments = await Appointment.find({
            therapistId: req.user.userId
        }).sort({ date: 1, time: 1 });

        res.status(200).json({ appointments });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// =========================================
// GET /api/appointments — all for logged-in user
// =========================================
router.get('/', verifyToken, async (req, res) => {
    try {
        const appointments = await Appointment.find({
            userId: req.user.userId
        }).sort({ date: 1, time: 1 });

        res.status(200).json({ appointments });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// =========================================
// PATCH /api/appointments/:id/status
// Therapist confirms or declines
// =========================================
router.patch('/:id/status', verifyToken, async (req, res) => {
    try {
        const { status } = req.body;

        if (!['approved', 'denied'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const appointment = await Appointment.findOneAndUpdate(
            { _id: req.params.id, therapistId: req.user.userId },
            { $set: { status } },
            { new: true }
        );

        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        res.status(200).json({ message: `Appointment ${status}`, appointment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// =========================================
// POST /api/appointments/:id/join
// Create Daily.co room and return URL
// =========================================
router.post('/:id/join', verifyToken, async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        const isUser = appointment.userId.toString() === req.user.userId;
        const isTherapist = appointment.therapistId.toString() === req.user.userId;

        if (!isUser && !isTherapist) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        if (appointment.status !== 'approved') {
            return res.status(400).json({ message: 'Appointment is not approved yet' });
        }

        if (appointment.type !== 'online') {
            return res.status(400).json({ message: 'This is an in-person appointment' });
        }

        const sessionDateTime = new Date(`${appointment.date}T${appointment.time}`);
        const diffMinutes = (sessionDateTime - new Date()) / (1000 * 60);

        if (diffMinutes > 10) {
            return res.status(400).json({
                message: `Session starts in ${Math.round(diffMinutes)} minutes. You can join 10 minutes before.`
            });
        }

        if (appointment.dailyRoomUrl) {
            return res.status(200).json({ url: appointment.dailyRoomUrl });
        }

        const room = await createDailyRoom(appointment._id);
        if (!room.url) return res.status(500).json({ message: 'Failed to create video room' });

        appointment.dailyRoomUrl = room.url;
        appointment.dailyRoomName = room.name;
        await appointment.save();

        res.status(200).json({ url: room.url });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// =========================================
// DELETE /api/appointments/:id
// =========================================
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const appointment = await Appointment.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

        res.status(200).json({ message: 'Appointment deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST or PATCH /api/appointments/:id/cancel
// router.patch('/:id/cancel', verifyToken, async (req, res) => {
//     try {
//         const appointment = await Appointment.findOneAndUpdate(
//             { _id: req.params.id, userId: req.user._id }, // Ensure the user owns this appointment
//             { $set: { status: 'canceled' } },
//             { new: true }
//         );

//         if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

//         res.status(200).json({ message: 'Appointment canceled successfully', appointment });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

module.exports = router;