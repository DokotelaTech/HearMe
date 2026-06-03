const axios = require('axios');

/**
 * Verify reCAPTCHA token with Google's API
 * @param {string} token - The reCAPTCHA token from frontend
 * @returns {Promise<{success: boolean, score: number, message: string}>}
 */
async function verifyCaptcha(token) {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
        console.error('RECAPTCHA_SECRET_KEY is not set in environment variables');
        return {
            success: false,
            score: 0,
            message: 'CAPTCHA verification service not configured'
        };
    }

    try {
        const response = await axios.post(
            'https://www.google.com/recaptcha/api/siteverify',
            null,
            {
                params: {
                    secret: secretKey,
                    response: token
                }
            }
        );

        const { success, score, action, challenge_ts, hostname } = response.data;

        // reCAPTCHA v3 returns a score (0.0 to 1.0)
        // Higher score = more likely legitimate, lower score = more likely bot
        // Typically, 0.5 is a good threshold

        if (!success) {
            return {
                success: false,
                score: 0,
                message: 'CAPTCHA verification failed'
            };
        }

        // If score is very low (suspicious activity), reject
        if (score < 0.3) {
            return {
                success: false,
                score,
                message: 'Suspicious activity detected. Please try again.'
            };
        }

        return {
            success: true,
            score,
            message: 'CAPTCHA verification successful',
            action,
            challenge_ts,
            hostname
        };

    } catch (error) {
        console.error('CAPTCHA verification error:', error.message);
        return {
            success: false,
            score: 0,
            message: 'Error verifying CAPTCHA'
        };
    }
}

module.exports = { verifyCaptcha };
