// const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Appointment = require('../database/models/Appointment');
const User = require('../database/models/users');

// =========================================
// EMAIL TRANSPORTER
// =========================================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// =========================================
// SEND REMINDER EMAIL
// =========================================
async function sendReminderEmail(to, name, therapistName, date, time, minutesLeft, role) {
    const subject = role === 'user'
        ? `⏰ Reminder: Your session starts in ${minutesLeft} minutes`
        : `⏰ Reminder: Session with client in ${minutesLeft} minutes`;

    const html = role === 'user' ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">Session Reminder</h2>
            <p>Hi ${name},</p>
            <p>Your therapy session with <strong>${therapistName}</strong> starts in <strong>${minutesLeft} minutes</strong>.</p>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Time:</strong> ${time}</p>
            <p>Please make sure you're ready to join on time.</p>
            <a href="${process.env.FRONTEND_URL}/user/profile"
               style="background:#7c3aed; color:white; padding:12px 24px; border-radius:6px; text-decoration:none; display:inline-block; margin-top:16px;">
                Go to My Sessions
            </a>
            <p style="margin-top:24px; color:#888;">The HearMe Team</p>
        </div>` : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0ea5e9;">Upcoming Session Reminder</h2>
            <p>Hi ${name},</p>
            <p>You have a session with a client in <strong>${minutesLeft} minutes</strong>.</p>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Time:</strong> ${time}</p>
            <p>Please make sure you're ready to start the call on time.</p>
            <a href="${process.env.FRONTEND_URL}/therapist/calendar"
               style="background:#0ea5e9; color:white; padding:12px 24px; border-radius:6px; text-decoration:none; display:inline-block; margin-top:16px;">
                Go to Calendar
            </a>
            <p style="margin-top:24px; color:#888;">The HearMe Team</p>
        </div>`;

    await transporter.sendMail({ from: `"HearMe" <${process.env.EMAIL_USER}>`, to, subject, html });
}

// =========================================
// CHECK & SEND REMINDERS
// =========================================
async function checkAndSendReminders() {
    try {
        const now = new Date();

        // Find all approved appointments
        const appointments = await Appointment.find({ status: 'approved' });

        for (const appointment of appointments) {
            const sessionDateTime = new Date(`${appointment.date}T${appointment.time}`);
            const diffMinutes = (sessionDateTime - now) / (1000 * 60);

            // Only send at 30 min and 10 min marks (within a 1 minute window)
            const shouldRemind = (diffMinutes <= 30 && diffMinutes > 29) ||
                                 (diffMinutes <= 10 && diffMinutes > 9);

            if (!shouldRemind) continue;

            const minutesLeft = diffMinutes <= 10 ? 10 : 30;

            // Get user and therapist
            const [user, therapist] = await Promise.all([
                User.findById(appointment.userId),
                User.findById(appointment.therapistId)
            ]);

            if (!user || !therapist) continue;

            const userName = user.anonymousName || user.username || user.email;
            const therapistName = `${therapist.firstName} ${therapist.lastName}`;

            // Send to user
            if (user.email) {
                await sendReminderEmail(
                    user.email,
                    userName,
                    therapistName,
                    appointment.date,
                    appointment.time,
                    minutesLeft,
                    'user'
                );
                console.log(`✅ Reminder sent to user: ${user.email} (${minutesLeft} min)`);
            }

            // Send to therapist
            if (therapist.email) {
                await sendReminderEmail(
                    therapist.email,
                    therapistName,
                    userName,
                    appointment.date,
                    appointment.time,
                    minutesLeft,
                    'therapist'
                );
                console.log(`✅ Reminder sent to therapist: ${therapist.email} (${minutesLeft} min)`);
            }
        }
    } catch (error) {
        console.error('Reminder job error:', error);
    }
}

// =========================================
// START CRON JOB — runs every minute
// =========================================
function startReminderJob() {
    cron.schedule('* * * * *', () => {
        checkAndSendReminders();
    });
    console.log('📅 Reminder job started');
}

module.exports = { startReminderJob };