const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const crypto  = require('crypto');
const dns     = require('dns').promises;
const User    = require('../database/models/users');
const { recordAuditLog } = require('../utils/auditLogger');

/* =========================================================================
   BREVO EMAIL SETUP  (uses HTTPS — works on Render free tier)
========================================================================= */
const Brevo = require('@getbrevo/brevo');

const brevoApi = new Brevo.TransactionalEmailsApi();
brevoApi.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;

async function sendEmail({ to, subject, html }) {
    const email = new Brevo.SendSmtpEmail();
    email.sender  = { email: process.env.EMAIL_USER || 'noreply@hearme.app', name: 'HearMe' };
    email.to      = [{ email: to }];
    email.subject = subject;
    email.htmlContent = html;
    await brevoApi.sendTransacEmail(email);
}

/* =========================================================================
   HELPERS
========================================================================= */
const emailVerificationCodes = new Map();
const passwordResetPins      = new Map();
const CODE_EXPIRY_MS         = 10 * 60 * 1000; // 10 minutes

function validatePasswordStrength(password) {
    const requirements = {
        length:    password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number:    /\d/.test(password),
        special:   /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
    const meetsRequirements = Object.values(requirements).filter(Boolean).length;
    return {
        isStrong: meetsRequirements >= 3,
        score:    meetsRequirements,
        requirements
    };
}

function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function hashCode(email, code) {
    return crypto
        .createHash('sha256')
        .update(`${email}:${code}:${process.env.JWT_SECRET || 'hearme'}`)
        .digest('hex');
}

async function emailDomainAcceptsMail(email) {
    const domain = email.split('@')[1];
    try {
        const records = await dns.resolveMx(domain);
        return records.length > 0;
    } catch {
        return false;
    }
}

function verifySubmittedCode(email, verificationCode) {
    const storedCode = emailVerificationCodes.get(email);
    if (!storedCode)                   return 'Please verify your email before creating an account.';
    if (Date.now() > storedCode.expiresAt) {
        emailVerificationCodes.delete(email);
        return 'Your verification code has expired. Please request a new one.';
    }
    if (storedCode.attempts >= 5) {
        emailVerificationCodes.delete(email);
        return 'Too many incorrect verification attempts. Please request a new code.';
    }
    const submittedHash = hashCode(email, verificationCode);
    const storedBuffer  = Buffer.from(storedCode.codeHash, 'hex');
    const submittedBuffer = Buffer.from(submittedHash, 'hex');
    if (
        storedBuffer.length !== submittedBuffer.length ||
        !crypto.timingSafeEqual(storedBuffer, submittedBuffer)
    ) {
        storedCode.attempts += 1;
        return 'Invalid email verification code.';
    }
    return null;
}

function verifyPasswordResetPin(email, pin) {
    const storedPin = passwordResetPins.get(email);
    if (!storedPin)                    return 'Please request a temporary PIN before resetting your password.';
    if (Date.now() > storedPin.expiresAt) {
        passwordResetPins.delete(email);
        return 'Your temporary PIN has expired. Please request a new one.';
    }
    if (storedPin.attempts >= 5) {
        passwordResetPins.delete(email);
        return 'Too many incorrect PIN attempts. Please request a new PIN.';
    }
    const submittedHash   = hashCode(email, pin);
    const storedBuffer    = Buffer.from(storedPin.pinHash, 'hex');
    const submittedBuffer = Buffer.from(submittedHash, 'hex');
    if (
        storedBuffer.length !== submittedBuffer.length ||
        !crypto.timingSafeEqual(storedBuffer, submittedBuffer)
    ) {
        storedPin.attempts += 1;
        return 'Invalid temporary PIN.';
    }
    return null;
}

/* =========================================================================
   SEND EMAIL VERIFICATION CODE  POST /api/auth/send-verification-code
========================================================================= */
router.post('/send-verification-code', async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);

        if (!isValidEmail(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'An account with this email already exists.' });
        }

        const domainAcceptsMail = await emailDomainAcceptsMail(email);
        if (!domainAcceptsMail) {
            return res.status(400).json({ message: 'Please use a real email address that can receive mail.' });
        }

        if (!process.env.BREVO_API_KEY) {
            return res.status(500).json({ message: 'Email service is not configured on the server.' });
        }

        const code = String(crypto.randomInt(100000, 1000000));
        emailVerificationCodes.set(email, {
            codeHash:  hashCode(email, code),
            expiresAt: Date.now() + CODE_EXPIRY_MS,
            attempts:  0
        });

        await sendEmail({
            to:      email,
            subject: 'Your HearMe verification code',
            html: `
                <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:12px;">
                    <h2 style="color:#9333ea;margin-bottom:8px;">Welcome to HearMe</h2>
                    <p style="color:#334155;">Your email verification code is:</p>
                    <div style="font-size:36px;font-weight:800;letter-spacing:8px;color:#1e293b;background:#fff;padding:20px;border-radius:8px;text-align:center;margin:16px 0;">${code}</div>
                    <p style="color:#64748b;font-size:13px;">This code expires in 10 minutes. If you did not request this, ignore this email.</p>
                </div>
            `
        });

        res.status(200).json({ message: 'Verification code sent. Please check your email.' });

    } catch (error) {
        console.error('Email Verification Error:', error);
        res.status(500).json({ message: 'Could not send verification code. Please try again.' });
    }
});

/* =========================================================================
   REQUEST PASSWORD RESET PIN  POST /api/auth/request-password-reset
========================================================================= */
router.post('/request-password-reset', async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);

        if (!isValidEmail(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'No account was found with this email address.' });
        }

        if (!process.env.BREVO_API_KEY) {
            return res.status(500).json({ message: 'Email service is not configured on the server.' });
        }

        const pin = String(crypto.randomInt(100000, 1000000));
        passwordResetPins.set(email, {
            pinHash:   hashCode(email, pin),
            expiresAt: Date.now() + CODE_EXPIRY_MS,
            attempts:  0
        });

        await sendEmail({
            to:      email,
            subject: 'Your HearMe password reset PIN',
            html: `
                <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:12px;">
                    <h2 style="color:#9333ea;margin-bottom:8px;">Password Reset</h2>
                    <p style="color:#334155;">Your temporary PIN is:</p>
                    <div style="font-size:36px;font-weight:800;letter-spacing:8px;color:#1e293b;background:#fff;padding:20px;border-radius:8px;text-align:center;margin:16px 0;">${pin}</div>
                    <p style="color:#64748b;font-size:13px;">This PIN expires in 10 minutes. If you did not request this, ignore this email.</p>
                </div>
            `
        });

        res.status(200).json({ message: 'Temporary PIN sent. Please check your email.' });

    } catch (error) {
        console.error('Password Reset Request Error:', error);
        res.status(500).json({ message: 'Could not send temporary PIN. Please try again.' });
    }
});

/* =========================================================================
   RESET PASSWORD WITH PIN  POST /api/auth/reset-password
========================================================================= */
router.post('/reset-password', async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        const { pin, password, confirmPassword } = req.body;

        if (!isValidEmail(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address.' });
        }
        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match.' });
        }

        const resetError = verifyPasswordResetPin(email, pin);
        if (resetError) return res.status(400).json({ message: resetError });

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'No account was found with this email address.' });
        }

        user.password = password;
        await user.save();
        passwordResetPins.delete(email);

        res.status(200).json({ message: 'Password reset successfully. You can now sign in.' });

    } catch (error) {
        console.error('Password Reset Error:', error);
        res.status(500).json({ message: 'Could not reset password. Please try again.' });
    }
});

/* =========================================================================
   SIGNUP  POST /api/auth/signup
========================================================================= */
router.post('/signup', async (req, res) => {
    try {
        const {
            role, email, password, username, anonymousName,
            userPhone, race, struggles, firstName, lastName,
            phone, qualification, licenseNumber, institutionName,
            specialization, location, termsAccepted, verificationCode
        } = req.body;

        const normalizedEmail = normalizeEmail(email);

        if (!isValidEmail(normalizedEmail)) {
            return res.status(400).json({ message: 'Please enter a valid email address.' });
        }

        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.isStrong) {
            return res.status(400).json({
                message: 'Password is too weak. It must contain at least 8 characters with uppercase, lowercase, numbers, and special characters.'
            });
        }

        const verificationError = verifySubmittedCode(normalizedEmail, verificationCode);
        if (verificationError) return res.status(400).json({ message: verificationError });

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: 'An account with this email already exists.' });
        }

        const newUser = new User({
            role,
            email:         normalizedEmail,
            password,
            termsAccepted,
            username:       role === 'user'      ? username        : undefined,
            anonymousName:  role === 'user'      ? anonymousName   : undefined,
            userPhone:      role === 'user'      ? userPhone       : undefined,
            race:           role === 'user'      ? race            : undefined,
            struggles:      role === 'user'      ? struggles       : [],
            firstName:      role === 'therapist' ? firstName       : undefined,
            lastName:       role === 'therapist' ? lastName        : undefined,
            phone:          role === 'therapist' ? phone           : undefined,
            qualification:  role === 'therapist' ? qualification   : undefined,
            licenseNumber:  role === 'therapist' ? licenseNumber   : undefined,
            institutionName:role === 'therapist' ? institutionName : undefined,
            specialization: role === 'therapist' ? specialization  : undefined,
            location:       role === 'therapist' ? location        : undefined
        });

        await newUser.save();
        emailVerificationCodes.delete(normalizedEmail);

        res.status(201).json({ message: 'Account created successfully!' });

    } catch (error) {
        console.error('Signup Route Error:', error);
        if (error.name === 'ValidationError' || error.message?.includes('required')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal server error during signup.' });
    }
});

/* =========================================================================
   LOGIN  POST /api/auth/login
========================================================================= */
router.post('/login', async (req, res) => {
    try {
        const { role, password } = req.body;
        const email = normalizeEmail(req.body.email);

        if (!['user', 'therapist'].includes(role)) {
            return res.status(400).json({ message: 'Please select a valid account type.' });
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address.' });
        }

        const user = await User.findOne({ email, role });
        if (!user) {
            await recordAuditLog(req, { action: 'Failed login attempt', targetEmail: email, metadata: { role } });
            return res.status(400).json({ message: 'Invalid login credentials.' });
        }

        if (user.accountStatus === 'suspended') {
            await recordAuditLog(req, { actor: user, action: 'Blocked login for suspended account', targetUser: user });
            return res.status(403).json({ message: 'This account has been suspended. Please contact support.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            await recordAuditLog(req, { actor: user, action: 'Failed login attempt', targetUser: user, metadata: { role } });
            return res.status(400).json({ message: 'Invalid login credentials.' });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id:            user._id,
                role:          user.role,
                anonymousName: user.anonymousName || ''
            }
        });

        await recordAuditLog(req, { actor: user, action: 'Successful login', targetUser: user });

    } catch (error) {
        console.error('Login Route Error:', error);
        res.status(500).json({ message: 'Internal server error during login.' });
    }
});

/* =========================================================================
   ADMIN LOGIN  POST /api/auth/admin-login
========================================================================= */
router.post('/admin-login', async (req, res) => {
    try {
        const { password } = req.body;
        const email = normalizeEmail(req.body.email);

        const user = await User.findOne({ email, role: 'admin' });
        if (!user) {
            await recordAuditLog(req, { action: 'Failed admin login attempt', targetEmail: email });
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (user.accountStatus === 'suspended') {
            await recordAuditLog(req, { actor: user, action: 'Blocked admin login for suspended account', targetUser: user });
            return res.status(403).json({ message: 'This admin account has been suspended.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            await recordAuditLog(req, { actor: user, action: 'Failed admin login attempt', targetUser: user });
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({ message: 'Login successful', token });

        await recordAuditLog(req, { actor: user, action: 'Successful admin login', targetUser: user });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;