const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../database/models/users');
const Appointment = require('../database/models/Appointment');
const { verifyToken } = require('../middleware/authMiddleware');

// =========================================
// GENERATE PAYFAST SIGNATURE
// =========================================
function generateSignature(data, passphrase) {
    let pfOutput = '';
    for (const key in data) {
        if (data[key] !== '') {
            pfOutput += `${key}=${encodeURIComponent(data[key]).replace(/%20/g, '+')}&`;
        }
    }
    // Remove last &
    pfOutput = pfOutput.slice(0, -1);
    if (passphrase) {
        pfOutput += `&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}`;
    }
    return crypto.createHash('md5').update(pfOutput).digest('hex');
}

// =========================================
// POST /api/payments/initiate
// Create payment data and return PayFast URL
// =========================================
router.post('/initiate', verifyToken, async (req, res) => {
    try {
        const { therapistId, date, time, type, note } = req.body;

        const user = await User.findById(req.user.userId);
        const therapist = await User.findById(therapistId);

        if (!therapist) {
            return res.status(404).json({ message: 'Therapist not found' });
        }

        const amount = therapist.sessionPrice || 500;
        const userName = user.anonymousName || user.username || 'User';
        const therapistName = `${therapist.firstName} ${therapist.lastName}`;

        // Store pending booking in DB before payment
        const appointment = new Appointment({
            userId: req.user.userId,
            therapistId,
            therapistName,
            userName,
            date,
            time,
            type: type || 'online',
            note,
            status: 'pending_payment'  // new status
        });
        await appointment.save();

        // Build PayFast payment data
        const pfData = {
            merchant_id: process.env.PAYFAST_MERCHANT_ID,
            merchant_key: process.env.PAYFAST_MERCHANT_KEY,
            return_url: `${process.env.FRONTEND_URL}/payment/success?appointmentId=${appointment._id}`,
            cancel_url: `${process.env.FRONTEND_URL}/payment/cancel?appointmentId=${appointment._id}`,
            notify_url: `${process.env.FRONTEND_URL}/api/payments/notify`,
            name_first: userName,
            name_last: '',
            email_address: user.email,
            m_payment_id: appointment._id.toString(),
            amount: amount.toFixed(2),
            item_name: `Therapy Session with ${therapistName}`,
            item_description: `${type || 'online'} session on ${date} at ${time}`
        };

        // Generate signature
        pfData.signature = generateSignature(pfData, process.env.PAYFAST_PASSPHRASE);

        res.status(200).json({
            paymentUrl: process.env.PAYFAST_URL,
            pfData,
            appointmentId: appointment._id
        });

    } catch (error) {
        console.error('Payment initiate error:', error);
        res.status(500).json({ message: error.message });
    }
});

// =========================================
// POST /api/payments/notify
// PayFast ITN — confirms payment was received
// =========================================
router.post('/notify', express.urlencoded({ extended: false }), async (req, res) => {
    try {
        const pfData = req.body;
        const appointmentId = pfData.m_payment_id;
        const paymentStatus = pfData.payment_status;

        if (paymentStatus === 'COMPLETE') {
            await Appointment.findByIdAndUpdate(
                appointmentId,
                { status: 'pending' },  // now visible to therapist
                { returnDocument: 'after' }
            );
            console.log(`✅ Payment confirmed for appointment: ${appointmentId}`);
        } else {
            await Appointment.findByIdAndUpdate(
                appointmentId,
                { status: 'cancelled' }
            );
            console.log(`❌ Payment failed for appointment: ${appointmentId}`);
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('PayFast notify error:', error);
        res.status(500).send('Error');
    }
});

// =========================================
// GET /api/payments/success/:id
// Confirm appointment after redirect
// =========================================
router.get('/confirm/:id', verifyToken, async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.status(200).json({ appointment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;