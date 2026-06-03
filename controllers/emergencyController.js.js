// ============================================================
//  controllers/emergencyController.js
// ============================================================

const User = require('../database/models/users');   // matches your actual file: database/models/users.js
const { BrevoClient } = require('@getbrevo/brevo');

// ── Brevo setup ───────────────────────────────────────────────
const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

const SITE_URL     = 'https://hearme-i94l.onrender.com';
const LOGIN_URL    = `${SITE_URL}/login`;
const SENDER_EMAIL = process.env.EMAIL_USER || 'noreply@hearme.app';
const SENDER_NAME  = 'HearMe';

// ── Generic send helper ───────────────────────────────────────
async function sendEmail({ to, subject, html }) {
    await brevo.transactionalEmails.sendTransacEmail({
        sender:      { email: SENDER_EMAIL, name: SENDER_NAME },
        to:          [{ email: to }],
        subject,
        htmlContent: html,
    });
}

// ── Email Templates ───────────────────────────────────────────

function sosAlertToTherapistHTML(therapistName, clientName) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Emergency SOS Alert – HearMe</title>
  <style>
    body{margin:0;padding:0;background:#f4f4f7;font-family:'Segoe UI',Arial,sans-serif;}
    .wrapper{max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);}
    .header{background:#c0392b;padding:32px 40px;text-align:center;}
    .header h1{color:#fff;margin:0;font-size:26px;letter-spacing:1px;}
    .header p{color:#f5b7b1;margin:8px 0 0;font-size:14px;}
    .body{padding:36px 40px;color:#333;}
    .body h2{margin:0 0 16px;font-size:20px;color:#c0392b;}
    .body p{line-height:1.7;margin:0 0 16px;font-size:15px;}
    .alert-box{background:#fdf2f2;border-left:4px solid #c0392b;padding:16px 20px;border-radius:6px;margin:20px 0;}
    .alert-box p{margin:0;font-size:15px;color:#c0392b;font-weight:600;}
    .btn-wrap{text-align:center;margin:28px 0 8px;}
    .btn{display:inline-block;background:#c0392b;color:#fff!important;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:16px;font-weight:700;letter-spacing:0.5px;}
    .footer{background:#f4f4f7;padding:20px 40px;text-align:center;color:#999;font-size:12px;}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🚨 Emergency SOS Alert</h1>
      <p>Immediate attention required</p>
    </div>
    <div class="body">
      <h2>Hi ${therapistName},</h2>
      <p>A client on HearMe has triggered an <strong>Emergency SOS</strong> and needs immediate online support.</p>
      <div class="alert-box">
        <p>Client: ${clientName} is requesting urgent help right now.</p>
      </div>
      <p>Please log in to your HearMe therapist portal as soon as possible and start a session with this client. Every minute counts.</p>
      <div class="btn-wrap">
        <a href="${LOGIN_URL}" class="btn">Go to HearMe Portal →</a>
      </div>
      <p style="font-size:13px;color:#888;text-align:center;">If you are unavailable, please ignore this message. Another therapist will be notified.</p>
    </div>
    <div class="footer">© ${new Date().getFullYear()} HearMe · You are receiving this because you are a registered HearMe therapist.</div>
  </div>
</body>
</html>`;
}

function sessionStartedToClientHTML(clientName, therapistName) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your Session Has Started – HearMe</title>
  <style>
    body{margin:0;padding:0;background:#f4f4f7;font-family:'Segoe UI',Arial,sans-serif;}
    .wrapper{max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);}
    .header{background:#1a7f64;padding:32px 40px;text-align:center;}
    .header h1{color:#fff;margin:0;font-size:26px;}
    .header p{color:#a8e6d9;margin:8px 0 0;font-size:14px;}
    .body{padding:36px 40px;color:#333;}
    .body h2{margin:0 0 16px;font-size:20px;color:#1a7f64;}
    .body p{line-height:1.7;margin:0 0 16px;font-size:15px;}
    .info-box{background:#f0faf7;border-left:4px solid #1a7f64;padding:16px 20px;border-radius:6px;margin:20px 0;}
    .info-box p{margin:0;font-size:15px;color:#1a7f64;font-weight:600;}
    .btn-wrap{text-align:center;margin:28px 0 8px;}
    .btn{display:inline-block;background:#1a7f64;color:#fff!important;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:16px;font-weight:700;letter-spacing:0.5px;}
    .footer{background:#f4f4f7;padding:20px 40px;text-align:center;color:#999;font-size:12px;}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>✅ Your Session Has Started</h1>
      <p>A therapist is ready for you</p>
    </div>
    <div class="body">
      <h2>Hi ${clientName},</h2>
      <p>Good news — your session with a HearMe therapist has just begun and they are ready to talk with you right now.</p>
      <div class="info-box">
        <p>Your therapist: ${therapistName} has started the call.</p>
      </div>
      <p>Click the button below to view your profile and join the session. Your therapist is waiting for you.</p>
      <div class="btn-wrap">
        <a href="${LOGIN_URL}" class="btn">Start Talking with ${therapistName} →</a>
      </div>
      <p style="font-size:13px;color:#888;text-align:center;">If you no longer need support, you may disregard this message.</p>
    </div>
    <div class="footer">© ${new Date().getFullYear()} HearMe · You're receiving this because you activated an SOS on HearMe.</div>
  </div>
</body>
</html>`;
}

function sessionStartedToTherapistHTML(therapistName, clientName) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Session Started – HearMe</title>
  <style>
    body{margin:0;padding:0;background:#f4f4f7;font-family:'Segoe UI',Arial,sans-serif;}
    .wrapper{max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);}
    .header{background:#2c3e50;padding:32px 40px;text-align:center;}
    .header h1{color:#fff;margin:0;font-size:26px;}
    .header p{color:#bdc3c7;margin:8px 0 0;font-size:14px;}
    .body{padding:36px 40px;color:#333;}
    .body h2{margin:0 0 16px;font-size:20px;color:#2c3e50;}
    .body p{line-height:1.7;margin:0 0 16px;font-size:15px;}
    .info-box{background:#f0f3f7;border-left:4px solid #2c3e50;padding:16px 20px;border-radius:6px;margin:20px 0;}
    .info-box p{margin:0;font-size:15px;color:#2c3e50;font-weight:600;}
    .btn-wrap{text-align:center;margin:28px 0 8px;}
    .btn{display:inline-block;background:#2c3e50;color:#fff!important;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:16px;font-weight:700;}
    .footer{background:#f4f4f7;padding:20px 40px;text-align:center;color:#999;font-size:12px;}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>📞 Session Confirmed</h1>
      <p>You have started an emergency session</p>
    </div>
    <div class="body">
      <h2>Hi ${therapistName},</h2>
      <p>This confirms that you have started an emergency session on HearMe.</p>
      <div class="info-box">
        <p>Client in session: ${clientName}</p>
      </div>
      <p>The client has been notified and directed to join. Click below to return to the portal at any time.</p>
      <div class="btn-wrap">
        <a href="${LOGIN_URL}" class="btn">Go to HearMe Portal →</a>
      </div>
    </div>
    <div class="footer">© ${new Date().getFullYear()} HearMe · Thank you for making a difference.</div>
  </div>
</body>
</html>`;
}

// ── Controllers ───────────────────────────────────────────────

/**
 * POST /api/emergency/sos
 * Authenticated user triggers SOS → emails all verified therapists.
 */
async function triggerSOS(req, res) {
    try {
        const client = req.user; // set by verifyToken in server.js

        // Fetch all verified active therapists
        const therapists = await User.find({
            role:          'therapist',
            profileStatus: 'verified',
            accountStatus: 'active',
        }).select('email firstName');

        if (!therapists.length) {
            return res.status(503).json({
                message: 'No therapists available right now. Please call emergency services.'
            });
        }

        // Get client display name from DB
        const clientUser  = await User.findById(client.userId).select('anonymousName username');
        const clientName  = clientUser?.anonymousName || clientUser?.username || 'A HearMe user';

        // Send emails in parallel — failures don't block the response
        const emailResults = await Promise.allSettled(
            therapists.map(t =>
                sendEmail({
                    to:      t.email,
                    subject: '🚨 Emergency SOS Alert – Immediate Support Needed',
                    html:    sosAlertToTherapistHTML(t.firstName || 'Therapist', clientName),
                })
            )
        );

        const sent = emailResults.filter(r => r.status === 'fulfilled').length;

        return res.status(200).json({
            message: `SOS sent to ${sent} therapist(s).`,
            count:   sent,
        });

    } catch (err) {
        console.error('[SOS] Error:', err);
        return res.status(500).json({
            message: 'SOS activation failed. Please call emergency services immediately.'
        });
    }
}

/**
 * POST /api/emergency/session-started
 * Called by the THERAPIST when they start a session with an SOS client.
 * Body: { clientId: "<mongo user _id>" }
 */
async function notifySessionStarted(req, res) {
    try {
        const therapist = req.user; // set by verifyToken in server.js
        const { clientId } = req.body;

        if (!clientId) {
            return res.status(400).json({ message: 'clientId is required.' });
        }

        // Get full therapist details from DB
        const therapistUser = await User.findById(therapist.userId).select('firstName lastName email');
        const client        = await User.findById(clientId).select('email username anonymousName');

        if (!client) {
            return res.status(404).json({ message: 'Client not found.' });
        }

        const therapistName = `${therapistUser?.firstName || ''} ${therapistUser?.lastName || ''}`.trim()
                              || 'Your HearMe Therapist';
        const clientName    = client.anonymousName || client.username || 'HearMe User';

        // Email the client
        await sendEmail({
            to:      client.email,
            subject: `✅ Your session with ${therapistName} has started – HearMe`,
            html:    sessionStartedToClientHTML(clientName, therapistName),
        });

        // Confirmation email to therapist
        if (therapistUser?.email) {
            await sendEmail({
                to:      therapistUser.email,
                subject: '📞 Session started – HearMe',
                html:    sessionStartedToTherapistHTML(therapistName, clientName),
            });
        }

        return res.status(200).json({ message: 'Session notification emails sent.' });

    } catch (err) {
        console.error('[SESSION-START] Error:', err);
        return res.status(500).json({ message: 'Failed to send session notifications.' });
    }
}

module.exports = { triggerSOS, notifySessionStarted };