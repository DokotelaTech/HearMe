<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const Appointment = require('../database/models/Appointment');
const { verifyToken } = require('../middleware/authMiddleware');

const {
    getAppointments,
    getMyAppointments,
    getTherapistAppointments,
    createAppointment,
    updateAppointmentStatus,
    cancelAppointment,
    updateAppointment,
    deleteAppointment
} = require('../controllers/appointmentController');

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
// STATIC ROUTES FIRST (before /:id)
// =========================================

// GET /api/appointments/my — user's own appointments
router.get('/my', verifyToken, getMyAppointments);

// GET /api/appointments/therapist — therapist sees their incoming bookings
router.get('/therapist', verifyToken, getTherapistAppointments);

// GET /api/appointments — all appointments for logged-in user
router.get('/', verifyToken, getAppointments);

// POST /api/appointments — user books appointment
router.post('/', verifyToken, createAppointment);

// =========================================
// DYNAMIC ROUTES (/:id last)
// =========================================

// PATCH /api/appointments/:id/status — therapist approves or denies
router.patch('/:id/status', verifyToken, updateAppointmentStatus);

// PATCH /api/appointments/:id/cancel — user cancels (sets status to cancelled, does NOT delete)
router.patch('/:id/cancel', verifyToken, cancelAppointment);

// POST /api/appointments/:id/join — creates Daily.co room and returns URL
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

// PUT /api/appointments/:id — general update
router.put('/:id', verifyToken, updateAppointment);

// DELETE /api/appointments/:id — hard delete
router.delete('/:id', verifyToken, deleteAppointment);

module.exports = router;
=======
const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middleware/authMiddleware");

const {
    getAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment
} = require("../controllers/appointmentController");

router.get("/", authMiddleware, getAppointments);
router.post("/", authMiddleware, createAppointment);
router.put("/:id", authMiddleware, updateAppointment);
router.delete("/:id", authMiddleware, deleteAppointment);

module.exports = router; 
>>>>>>> 98ea0a3 (sprint 2)
