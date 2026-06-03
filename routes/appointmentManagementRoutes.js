const express = require('express');
const router = express.Router();
const Appointment = require('../database/models/Appointment');
const { verifyToken } = require('../middleware/authMiddleware');

/* =========================================================================
   GET USER'S ACTIVE/ENDED APPOINTMENTS
========================================================================= */
router.get('/appointments', verifyToken, async (req, res) => {
    try {
        const { userId } = req.user;

        const appointments = await Appointment.find({
            $or: [
                { userId },
                { therapistId: userId }
            ]
        }).populate('userId therapistId', 'firstName lastName anonymousName email')
            .sort({ appointmentDate: -1 });

        res.status(200).json({
            appointments: appointments.map(apt => ({
                id: apt._id,
                date: apt.appointmentDate,
                status: apt.status, // 'scheduled', 'completed', 'cancelled'
                therapistName: apt.therapistId.firstName ? `${apt.therapistId.firstName} ${apt.therapistId.lastName}` : apt.therapistId.anonymousName,
                userName: apt.userId.anonymousName || apt.userId.firstName,
                meetingLink: apt.meetingLink,
                isEnded: apt.status === 'completed',
                duration: apt.duration
            }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/* =========================================================================
   END APPOINTMENT SESSION
========================================================================= */
router.post('/appointments/:id/end', verifyToken, async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found.' });
        }

        // Update appointment status to completed
        appointment.status = 'completed';
        appointment.endedAt = new Date();
        await appointment.save();

        res.status(200).json({
            message: 'Session ended successfully.',
            isEnded: true
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/* =========================================================================
   CHECK IF USER CAN JOIN SESSION
========================================================================= */
router.get('/appointments/:id/can-join', verifyToken, async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found.' });
        }

        const isEnded = appointment.status === 'completed';
        const canJoin = !isEnded && appointment.status === 'scheduled';

        res.status(200).json({
            canJoin,
            isEnded,
            status: appointment.status,
            meetingLink: canJoin ? appointment.meetingLink : null
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
