const nodemailer = require('nodemailer');

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

function buildReportEmailTemplate({ title, greeting, message, actionDetails }) {
    const safeDetails = actionDetails ? `
        <div style="margin-top: 15px; padding: 10px; background: #f8fafc; border-left: 4px solid #9333ea;">
            <p style="margin:0; font-size: 14px; color: #475569;">${escapeHtml(actionDetails)}</p>
        </div>
    ` : '';

    return `
        <div style="margin:0;padding:0;background:#f6f8fb;font-family:Inter,Arial,sans-serif;color:#0f172a;">
            <div style="max-width:640px;margin:0 auto;padding:32px 18px;">
                <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;box-shadow:0 14px 40px rgba(15,23,42,0.08);">
                    <div style="padding:28px 32px;background:#9333ea;color:#ffffff;">
                        <h1 style="font-size:20px;line-height:1.25;margin:0;">${escapeHtml(title)}</h1>
                    </div>
                    <div style="padding:30px 32px;">
                        <p style="font-size:16px;line-height:1.7;margin:0 0 14px;">${escapeHtml(greeting)}</p>
                        <p style="font-size:15px;line-height:1.7;margin:0 0 24px;color:#334155;">${escapeHtml(message)}</p>
                        ${safeDetails}
                    </div>
                    <div style="padding:18px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px;">
                        This is an automated message from the HearMe Moderation Team.
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function sendReporterEmail(toEmail, status, reportCategory, adminNote = '') {
    if (!toEmail) return; // Guard clause

    const statusMessages = {
        'resolved': 'We have reviewed your report and taken the appropriate action. Thank you for helping keep HearMe safe.',
        'dismissed': 'We have reviewed your report. Based on our guidelines, no further action is required at this time.',
        'deleted': 'We have reviewed your report and removed the content in question. Thank you for reporting this to us.'
    };

    const message = statusMessages[status] || `Your report regarding '${reportCategory}' has been updated to: ${status}.`;

    const html = buildReportEmailTemplate({
        title: 'Update on Your Report',
        greeting: 'Hello,',
        message: message,
        actionDetails: adminNote ? `Admin response: ${adminNote}` : ''
    });

    try {
        await transporter.sendMail({
            from: `"HearMe Moderation" <${process.env.EMAIL_USER.trim()}>`,
            to: toEmail,
            subject: 'Update on Your HearMe Report',
            html
        });
    } catch (error) {
        console.error(`Failed to send reporter email to ${toEmail}:`, error.message);
    }
}

async function sendEmergencyTherapistEmail(toEmail, { clientName, appointmentId }) {
    if (!toEmail) return;

    const html = `
        <div style="margin:0;padding:0;background:#fff1f2;font-family:Inter,Arial,sans-serif;color:#7f1d1d;">
            <div style="max-width:640px;margin:0 auto;padding:32px 18px;">
                <div style="background:#ffffff;border:2px solid #ef4444;border-radius:16px;overflow:hidden;box-shadow:0 16px 45px rgba(239,68,68,0.18);">
                    <div style="padding:24px 30px;background:#dc2626;color:#ffffff;">
                        <h1 style="font-size:22px;line-height:1.25;margin:0;">Emergency SOS Booking</h1>
                    </div>
                    <div style="padding:28px 30px;">
                        <p style="font-size:16px;line-height:1.7;margin:0 0 14px;">A HearMe client needs immediate support.</p>
                        <p style="font-size:15px;line-height:1.7;margin:0 0 18px;color:#991b1b;">
                            Client: <strong>${escapeHtml(clientName || 'Anonymous client')}</strong>
                        </p>
                        <p style="font-size:14px;line-height:1.7;margin:0;color:#475569;">
                            Open your therapist calendar and accept the glowing emergency booking to start the video call immediately.
                        </p>
                    </div>
                    <div style="padding:16px 30px;background:#fef2f2;border-top:1px solid #fecaca;color:#991b1b;font-size:12px;">
                        Emergency appointment ID: ${escapeHtml(appointmentId)}
                    </div>
                </div>
            </div>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: `"HearMe Emergency" <${process.env.EMAIL_USER.trim()}>`,
            to: toEmail,
            subject: 'URGENT: Emergency SOS Booking Requires Response',
            html
        });
    } catch (error) {
        console.error(`Failed to send emergency email to ${toEmail}:`, error.message);
    }
}

async function sendReportedUserEmail(toEmail, status, contentSnippet) {
    if (!toEmail) return; // Guard clause
    if (status !== 'deleted' && status !== 'resolved') return; // Only notify if action was taken

    const message = status === 'deleted' 
        ? 'A post you made has been removed from the platform for violating our community guidelines.'
        : 'Content you posted was reviewed and action was taken following a community report.';

    const html = buildReportEmailTemplate({
        title: 'Notice Regarding Your Content',
        greeting: 'Hello,',
        message: message,
        actionDetails: `Content referenced: "${contentSnippet || 'Content removed'}"`
    });

    try {
        await transporter.sendMail({
            from: `"HearMe Moderation" <${process.env.EMAIL_USER.trim()}>`,
            to: toEmail,
            subject: 'Notice from HearMe Moderation',
            html
        });
    } catch (error) {
        console.error(`Failed to send reported user email to ${toEmail}:`, error.message);
    }
}

module.exports = { sendReporterEmail, sendReportedUserEmail, sendEmergencyTherapistEmail };
