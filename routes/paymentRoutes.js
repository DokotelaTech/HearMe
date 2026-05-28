const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../database/models/users');
const Appointment = require('../database/models/Appointment');
const { verifyToken } = require('../middleware/authMiddleware');

// =========================================
// GENERATE PAYFAST SIGNATURE
// Based on official PayFast documentation
// =========================================
function generateSignature(data, passphrase = null) {
    // Remove signature field if present
    const pfData = { ...data };
    delete pfData.signature;

    // Build query string
    let pfParamString = '';
    for (const key in pfData) {
        if (pfData[key] !== '' && pfData[key] !== null && pfData[key] !== undefined) {
            pfParamString += `${key}=${encodeURIComponent(pfData[key]).replace(/%20/g, '+')}&`;
        }
    }

    // Remove trailing &
    pfParamString = pfParamString.slice(0, -1);

    // Append passphrase if set
    if (passphrase !== null && passphrase !== '') {
        pfParamString += `&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}`;
    }

    console.log('PayFast signature string:', pfParamString);
    return crypto.createHash('md5').update(pfParamString).digest('hex');
}

// =========================================
// POST /api/payments/initiate
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

        // Save appointment
        const appointment = new Appointment({
            userId: req.user.userId,
            therapistId,
            therapistName,
            userName,
            date,
            time,
            type: type || 'online',
            note,
            status: 'pending_payment'
        });
        await appointment.save();

        // Build PayFast fields in exact required order
        const pfData = {
            merchant_id:   process.env.PAYFAST_MERCHANT_ID,
            merchant_key:  process.env.PAYFAST_MERCHANT_KEY,
            return_url:    `${process.env.FRONTEND_URL}/payment/success?appointmentId=${appointment._id}`,
            cancel_url:    `${process.env.FRONTEND_URL}/payment/cancel?appointmentId=${appointment._id}`,
            notify_url:    `${process.env.FRONTEND_URL}/api/payments/notify`,
            name_first:    (userName.split(' ')[0] || 'User').substring(0, 50),
            name_last:     (userName.split(' ')[1] || '').substring(0, 100),
            email_address: user.email,
            m_payment_id:  appointment._id.toString(),
            amount:        Number(amount).toFixed(2),
            item_name:     `Therapy Session with ${therapistName}`.substring(0, 100)
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
// =========================================
router.post('/notify', express.urlencoded({ extended: false }), async (req, res) => {
    try {
        const pfData = req.body;
        const appointmentId = pfData.m_payment_id;
        const paymentStatus = pfData.payment_status;

        console.log('PayFast notify:', pfData);

        if (paymentStatus === 'COMPLETE') {
            await Appointment.findByIdAndUpdate(
                appointmentId,
                { status: 'pending' },
                { returnDocument: 'after' }
            );
            console.log(`✅ Payment confirmed: ${appointmentId}`);
        } else {
            await Appointment.findByIdAndUpdate(
                appointmentId,
                { status: 'cancelled' }
            );
            console.log(`❌ Payment failed: ${appointmentId}`);
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('PayFast notify error:', error);
        res.status(500).send('Error');
    }
});

// =========================================
// GET /api/payments/confirm/:id
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

// =========================================
// PATCH /api/payments/cancel/:id
// =========================================
router.patch('/cancel/:id', verifyToken, async (req, res) => {
    try {
        await Appointment.findByIdAndUpdate(req.params.id, { status: 'cancelled' });
        res.status(200).json({ message: 'Appointment cancelled' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;