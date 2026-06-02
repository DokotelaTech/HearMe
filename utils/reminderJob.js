const nodemailer = require('nodemailer');
const Appointment = require('../database/models/Appointment');
const User = require('../database/models/users');

const REMINDER_WINDOW_MINUTES = 10;
const CHECK_INTERVAL_MS = 60 * 1000;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER?.trim(),
        pass: process.env.EMAIL_PASS?.trim()
    }
});

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatSessionDate(dateValue) {
    const date = new Date(`${dateValue}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return dateValue;
    }

    return date.toLocaleDateString('en-ZA', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function formatSessionTime(timeValue) {
    const date = new Date(`2000-01-01T${timeValue}`);

    if (Number.isNaN(date.getTime())) {
        return timeValue;
    }

    return date.toLocaleTimeString('en-ZA', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function buildEmailTemplate({
    title,
    greeting,
    intro,
    details,
    actionUrl,
    actionText,
    accentColor
}) {
    const safeDetails = details.map((item) => `
        <tr>
            <td style="padding:10px 0;color:#64748b;font-size:14px;">${escapeHtml(item.label)}</td>
            <td style="padding:10px 0;color:#0f172a;font-size:14px;font-weight:700;text-align:right;">${escapeHtml(item.value)}</td>
        </tr>
    `).join('');

    return `
        <div style="margin:0;padding:0;background:#f6f8fb;font-family:Inter,Arial,sans-serif;color:#0f172a;">
            <div style="max-width:640px;margin:0 auto;padding:32px 18px;">
                <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;box-shadow:0 14px 40px rgba(15,23,42,0.08);">
                    <div style="padding:28px 32px;background:${accentColor};color:#ffffff;">
                        <div style="font-size:13px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;opacity:0.88;">HearMe</div>
                        <h1 style="font-size:25px;line-height:1.25;margin:12px 0 0;">${escapeHtml(title)}</h1>
                    </div>

                    <div style="padding:30px 32px;">
                        <p style="font-size:16px;line-height:1.7;margin:0 0 14px;">${escapeHtml(greeting)}</p>
                        <p style="font-size:15px;line-height:1.7;margin:0 0 24px;color:#334155;">${escapeHtml(intro)}</p>

                        <table style="width:100%;border-collapse:collapse;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;margin-bottom:26px;">
                            ${safeDetails}
                        </table>

                        <a href="${escapeHtml(actionUrl)}" style="display:inline-block;background:${accentColor};color:#ffffff;text-decoration:none;padding:13px 20px;border-radius:10px;font-weight:800;font-size:14px;">
                            ${escapeHtml(actionText)}
                        </a>

                        <p style="font-size:13px;line-height:1.6;margin:24px 0 0;color:#64748b;">
                            Please be ready a few minutes early. If your session is online, join from a quiet private space with a stable connection.
                        </p>
                    </div>

                    <div style="padding:18px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px;line-height:1.6;">
                        This is an automatic session reminder from HearMe.
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function sendReminderEmail({ to, role, userName, therapistName, date, time, type }) {
    const sessionDate = formatSessionDate(date);
    const sessionTime = formatSessionTime(time);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5000';

    const isUser = role === 'user';
    const subject = isUser
        ? 'HearMe reminder: your session starts in 10 minutes'
        : 'HearMe reminder: your client session starts in 10 minutes';

    const html = buildEmailTemplate({
        title: isUser
            ? 'Your session starts in 10 minutes'
            : 'Your client session starts in 10 minutes',
        greeting: isUser
            ? `Hi ${userName},`
            : `Hi ${therapistName},`,
        intro: isUser
            ? `Your upcoming HearMe session with ${therapistName} is almost ready to begin.`
            : `Your upcoming HearMe session with ${userName} is almost ready to begin.`,
        details: [
            { label: isUser ? 'Therapist' : 'Client', value: isUser ? therapistName : userName },
            { label: 'Date', value: sessionDate },
            { label: 'Time', value: sessionTime },
            { label: 'Session type', value: type === 'in-person' ? 'In person' : 'Online' }
        ],
        // CORRECTED LINE BELOW:
        actionUrl: isUser ? `${frontendUrl}/login` : `${frontendUrl}/login`, 
        actionText: isUser ? 'View My Session' : 'Open Calendar',
        accentColor: isUser ? '#9333ea' : '#2563eb'
    });

async function checkAndSendReminders() {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('Reminder job skipped: EMAIL_USER or EMAIL_PASS is not configured.');
        return;
    }

    try {
        const now = new Date();
        const appointments = await Appointment.find({
            status: 'approved',
            $or: [
                { 'reminder10Sent.user': { $ne: true } },
                { 'reminder10Sent.therapist': { $ne: true } }
            ]
        });

        for (const appointment of appointments) {
            const sessionDateTime = new Date(`${appointment.date}T${appointment.time}`);
            const diffMinutes = (sessionDateTime - now) / (1000 * 60);

            if (diffMinutes > REMINDER_WINDOW_MINUTES || diffMinutes <= 0) {
                continue;
            }

            const [user, therapist] = await Promise.all([
                User.findById(appointment.userId),
                User.findById(appointment.therapistId)
            ]);

            if (!user || !therapist) {
                continue;
            }

            const userName = user.anonymousName || user.username || user.email;
            const therapistName = `${therapist.firstName || ''} ${therapist.lastName || ''}`.trim() || therapist.email;
            appointment.reminder10Sent = appointment.reminder10Sent || {};

            if (user.email && appointment.reminder10Sent?.user !== true) {
                await sendReminderEmail({
                    to: user.email,
                    role: 'user',
                    userName,
                    therapistName,
                    date: appointment.date,
                    time: appointment.time,
                    type: appointment.type
                });
                appointment.reminder10Sent.user = true;
            }

            if (therapist.email && appointment.reminder10Sent?.therapist !== true) {
                await sendReminderEmail({
                    to: therapist.email,
                    role: 'therapist',
                    userName,
                    therapistName,
                    date: appointment.date,
                    time: appointment.time,
                    type: appointment.type
                });
                appointment.reminder10Sent.therapist = true;
            }

            await appointment.save();
        }
    } catch (error) {
        console.error('Reminder job error:', error);
    }
}

function startReminderJob() {
    checkAndSendReminders();
    setInterval(checkAndSendReminders, CHECK_INTERVAL_MS);
    console.log('Session reminder job started');
}

module.exports = { startReminderJob, checkAndSendReminders };
