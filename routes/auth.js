const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const dns = require('dns').promises;
const nodemailer = require('nodemailer');
const User = require('../database/models/users'); // Path to your users model
const { recordAuditLog } = require('../utils/auditLogger');

// Helper function to validate password strength
function validatePasswordStrength(password) {
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
    
    const meetsRequirements = Object.values(requirements).filter(Boolean).length;
    return {
        isStrong: meetsRequirements >= 3,
        score: meetsRequirements,
        requirements
    };
}

const emailVerificationCodes = new Map();
const passwordResetPins = new Map();
const CODE_EXPIRY_MS = 10 * 60 * 1000;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER?.trim(),
        pass: process.env.EMAIL_PASS?.trim()
    }
});

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
    } catch (error) {
        return false;
    }
}

function verifySubmittedCode(email, verificationCode) {
    const storedCode = emailVerificationCodes.get(email);

    if (!storedCode) {
        return 'Please verify your email before creating an account.';
    }

    if (Date.now() > storedCode.expiresAt) {
        emailVerificationCodes.delete(email);
        return 'Your verification code has expired. Please request a new one.';
    }

    if (storedCode.attempts >= 5) {
        emailVerificationCodes.delete(email);
        return 'Too many incorrect verification attempts. Please request a new code.';
    }

    const submittedHash = hashCode(email, verificationCode);
    const storedBuffer = Buffer.from(storedCode.codeHash, 'hex');
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

    if (!storedPin) {
        return 'Please request a temporary PIN before resetting your password.';
    }

    if (Date.now() > storedPin.expiresAt) {
        passwordResetPins.delete(email);
        return 'Your temporary PIN has expired. Please request a new one.';
    }

    if (storedPin.attempts >= 5) {
        passwordResetPins.delete(email);
        return 'Too many incorrect PIN attempts. Please request a new PIN.';
    }

    const submittedHash = hashCode(email, pin);
    const storedBuffer = Buffer.from(storedPin.pinHash, 'hex');
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
   SEND EMAIL VERIFICATION CODE (POST /api/auth/send-verification-code)
========================================================================= */
router.post('/send-verification-code', async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);

        if (!isValidEmail(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: 'An account with this email already exists.'
            });
        }

        const domainAcceptsMail = await emailDomainAcceptsMail(email);
        if (!domainAcceptsMail) {
            return res.status(400).json({
                message: 'Please use a real email address that can receive mail.'
            });
        }

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            return res.status(500).json({
                message: 'Email verification is not configured on the server.'
            });
        }

        const code = String(crypto.randomInt(100000, 1000000));
        emailVerificationCodes.set(email, {
            codeHash: hashCode(email, code),
            expiresAt: Date.now() + CODE_EXPIRY_MS,
            attempts: 0
        });

        await transporter.sendMail({
            from: `"HearMe" <${process.env.EMAIL_USER.trim()}>`,
            to: email,
            subject: 'Your HearMe verification code',
            html: `
                <p>Welcome to HearMe.</p>
                <p>Your email verification code is <strong>${code}</strong>.</p>
                <p>This code expires in 10 minutes.</p>
            `
        });

        res.status(200).json({
            message: 'Verification code sent. Please check your email.'
        });
    } catch (error) {
        console.error('Email Verification Error:', error);
        res.status(500).json({
            message: 'Could not send verification code. Please try again.'
        });
    }
});

/* =========================================================================
   REQUEST PASSWORD RESET PIN (POST /api/auth/request-password-reset)
========================================================================= */
router.post('/request-password-reset', async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);

        if (!isValidEmail(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: 'No account was found with this email address.'
            });
        }

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            return res.status(500).json({
                message: 'Password reset email is not configured on the server.'
            });
        }

        const pin = String(crypto.randomInt(100000, 1000000));
        passwordResetPins.set(email, {
            pinHash: hashCode(email, pin),
            expiresAt: Date.now() + CODE_EXPIRY_MS,
            attempts: 0
        });

        await transporter.sendMail({
            from: `"HearMe" <${process.env.EMAIL_USER.trim()}>`,
            to: email,
            subject: 'Your HearMe password reset PIN',
            html: `
                <p>You requested to reset your HearMe password.</p>
                <p>Your temporary PIN is <strong>${pin}</strong>.</p>
                <p>This PIN expires in 10 minutes. If you did not request this, you can ignore this email.</p>
            `
        });

        res.status(200).json({
            message: 'Temporary PIN sent. Please check your email.'
        });
    } catch (error) {
        console.error('Password Reset Request Error:', error);
        res.status(500).json({
            message: 'Could not send temporary PIN. Please try again.'
        });
    }
});

/* =========================================================================
   RESET PASSWORD WITH PIN (POST /api/auth/reset-password)
========================================================================= */
router.post('/reset-password', async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        const { pin, password, confirmPassword } = req.body;

        if (!isValidEmail(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address.' });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({
                message: 'Password must be at least 6 characters long.'
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match.' });
        }

        const resetError = verifyPasswordResetPin(email, pin);
        if (resetError) {
            return res.status(400).json({ message: resetError });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: 'No account was found with this email address.'
            });
        }

        user.password = password;
        await user.save();
        passwordResetPins.delete(email);

        res.status(200).json({
            message: 'Password reset successfully. You can now sign in.'
        });
    } catch (error) {
        console.error('Password Reset Error:', error);
        res.status(500).json({
            message: 'Could not reset password. Please try again.'
        });
    }
});

/* =========================================================================
   SIGNUP ROUTE (POST /api/auth/signup)
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

        // Validate password strength
        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.isStrong) {
            return res.status(400).json({ 
                message: 'Password is too weak. It must contain at least 8 characters, including uppercase letters, lowercase letters, numbers, and special characters.' 
            });
        }

        const verificationError = verifySubmittedCode(normalizedEmail, verificationCode);
        if (verificationError) {
            return res.status(400).json({ message: verificationError });
        }

        // 1. Check if user already exists
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ 
                message: 'An account with this email already exists.' 
            });
        }

        // 2. Create a new user instance
        // Mongoose pre('validate') hook will automatically check required fields based on the role
        const newUser = new User({
            role,
            email: normalizedEmail,
            password, // Passed raw; userSchema pre('save') hook will automatically hash this
            termsAccepted,
            // User-specific fields (default to undefined or empty if not provided)
            username: role === 'user' ? username : undefined,
            anonymousName: role === 'user' ? anonymousName : undefined,
            userPhone: role === 'user' ? userPhone : undefined,
            race: role === 'user' ? race : undefined,
            struggles: role === 'user' ? struggles : [],
            // Therapist-specific fields
            firstName: role === 'therapist' ? firstName : undefined,
            lastName: role === 'therapist' ? lastName : undefined,
            phone: role === 'therapist' ? phone : undefined,
            qualification: role === 'therapist' ? qualification : undefined,
            licenseNumber: role === 'therapist' ? licenseNumber : undefined,
            institutionName: role === 'therapist' ? institutionName : undefined,
            specialization: role === 'therapist' ? specialization : undefined,
            location: role === 'therapist' ? location : undefined
        });

        // 3. Save user to database (Triggers validation & password hashing hooks)
        await newUser.save();
        emailVerificationCodes.delete(normalizedEmail);

        // 4. Return success response
        res.status(201).json({ 
            message: 'Account created successfully!' 
        });

    } catch (error) {
        console.error('Signup Route Error:', error);
        
        // Handle Mongoose validation errors gracefully instead of generic 500
        if (error.name === 'ValidationError' || error.message.includes('required')) {
            return res.status(400).json({ message: error.message });
        }
        
        res.status(500).json({ 
            message: 'Internal server error during signup.' 
        });
    }
});

/* =========================================================================
   LOGIN ROUTE (POST /api/auth/login)
========================================================================= */
router.post('/login', async (req, res) => {
    try {
        const { role, email, password } = req.body;
        const normalizedEmail = normalizeEmail(email);

        if (!['user', 'therapist'].includes(role)) {
            return res.status(400).json({
                message: 'Please select a valid account type.'
            });
        }

        if (!isValidEmail(normalizedEmail)) {
            return res.status(400).json({
                message: 'Please enter a valid email address.'
            });
        }

        // 1. Find user by email and selected account type
        const user = await User.findOne({ email: normalizedEmail, role });
        if (!user) {
            await recordAuditLog(req, {
                action: 'Failed login attempt',
                targetEmail: normalizedEmail,
                metadata: { role }
            });
            return res.status(400).json({ 
                message: 'Invalid login credentials.' 
            });
        }

        if (user.accountStatus === 'suspended') {
            await recordAuditLog(req, {
                actor: user,
                action: 'Blocked login for suspended account',
                targetUser: user
            });
            return res.status(403).json({
                message: 'This account has been suspended. Please contact support.'
            });
        }

        // 2. Compare hashed password using the schema method we added
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            await recordAuditLog(req, {
                actor: user,
                action: 'Failed login attempt',
                targetUser: user,
                metadata: { role }
            });
            return res.status(400).json({ 
                message: 'Invalid login credentials.' 
            });
        }

        // 3. Generate JWT Token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' } // Token expires in 24 hours
        );

        // 4. Respond with token and key user data required by login.js localstorage
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                role: user.role,
                anonymousName: user.anonymousName || ''
            }
        });

        await recordAuditLog(req, {
            actor: user,
            action: 'Successful login',
            targetUser: user
        });

    } catch (error) {
        console.error('Login Route Error:', error);
        res.status(500).json({ 
            message: 'Internal server error during login.' 
        });
    }
});


// POST /api/auth/admin-login
router.post('/admin-login', async (req, res) => {
    try {
        const { password } = req.body;
        const email = normalizeEmail(req.body.email);

        // Find user with admin role
        const user = await User.findOne({ email, role: 'admin' });
        if (!user) {
            await recordAuditLog(req, {
                action: 'Failed admin login attempt',
                targetEmail: email
            });
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (user.accountStatus === 'suspended') {
            await recordAuditLog(req, {
                actor: user,
                action: 'Blocked admin login for suspended account',
                targetUser: user
            });
            return res.status(403).json({ message: 'This admin account has been suspended' });
        }

        // Compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            await recordAuditLog(req, {
                actor: user,
                action: 'Failed admin login attempt',
                targetUser: user
            });
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: 'Login successful',
            token
        });

        await recordAuditLog(req, {
            actor: user,
            action: 'Successful admin login',
            targetUser: user
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
