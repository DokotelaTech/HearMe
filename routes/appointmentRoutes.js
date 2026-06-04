const express = require('express');
const router = express.Router();
const Appointment = require('../database/models/Appointment');
const User = require('../database/models/users');
const { verifyToken } = require('../middleware/authMiddleware');
const { sendEmergencyTherapistEmail } = require('../utils/mailer');
const crypto = require('crypto');

const {
    getAppointments,
    getMyAppointments,
    getTherapistAppointments,
    createAppointment,
    updateAppointmentStatus,
    cancelAppointment,
    updateAppointment,
    deleteAppointment,
    createAppointmentReview
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

// POST /api/appointments/emergency - user triggers SOS booking for therapists
router.post('/emergency', verifyToken, async (req, res) => {
    try {
        const client = await User.findById(req.user.userId).select('username anonymousName email role');
        if (!client) return res.status(404).json({ message: 'User not found' });
        if (client.role !== 'user') return res.status(403).json({ message: 'Only clients can activate SOS bookings' });

        const therapists = await User.find({
            role: 'therapist',
            accountStatus: { $ne: 'suspended' }
        }).select('firstName lastName email');

        if (!therapists.length) {
            return res.status(404).json({ message: 'No therapists are available for emergency SOS right now' });
        }

        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const emergencyGroupId = crypto.randomUUID();
        const clientName = client.anonymousName || client.username || client.email || 'Anonymous client';
        const note = (req.body && req.body.note) || 'Emergency SOS request. Please accept only if you can start the call immediately.';

        const appointments = await Appointment.insertMany(therapists.map(therapist => ({
            userId: client._id,
            therapistId: therapist._id,
            therapistName: `${therapist.firstName || ''} ${therapist.lastName || ''}`.trim() || therapist.email,
            clientName,
            date,
            time,
            type: 'online',
            note,
            status: 'pending',
            isEmergency: true,
            emergencyGroupId
        })));

        await Promise.allSettled(appointments.map(appointment => {
            const therapist = therapists.find(t => t._id.toString() === appointment.therapistId.toString());
            return sendEmergencyTherapistEmail(therapist?.email, {
                clientName,
                appointmentId: appointment._id
            });
        }));

        res.status(201).json({
            message: 'Emergency SOS sent to available therapists',
            emergencyGroupId,
            count: appointments.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// =========================================
// DYNAMIC ROUTES (/:id last)
// =========================================

// PATCH /api/appointments/:id/status — therapist approves or denies
router.patch('/:id/status', verifyToken, updateAppointmentStatus);

// PATCH /api/appointments/:id/cancel — user cancels (sets status to cancelled, does NOT delete)
router.patch('/:id/cancel', verifyToken, cancelAppointment);

router.post('/:id/review', verifyToken, createAppointmentReview);

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

        if (!appointment.isEmergency && diffMinutes > 10) {
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


// PATCH /api/appointments/:id/status
router.patch('/:id/status', verifyToken, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['approved', 'denied', 'cancelled', 'completed'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        if (appointment.therapistId.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        appointment.status = status;
        await appointment.save();

        res.status(200).json({ message: `Appointment ${status}`, appointment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/appointments/:id — general update
router.put('/:id', verifyToken, updateAppointment);

// DELETE /api/appointments/:id — hard delete
router.delete('/:id', verifyToken, deleteAppointment);

module.exports = router;
