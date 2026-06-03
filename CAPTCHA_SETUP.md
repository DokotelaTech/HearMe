# CAPTCHA Integration Setup Guide

This guide will help you set up Google reCAPTCHA v3 for your HearMe login and signup pages.

## Step 1: Get Your reCAPTCHA Keys

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Sign in with your Google account (create one if needed)
3. Click the **+** button to create a new site
4. Fill in the form:
   - **Label**: HearMe (or any name you prefer)
   - **reCAPTCHA type**: Select **reCAPTCHA v3**
   - **Domains**: Add your domain(s):
     - For local development: `localhost:5000`
     - For production: `yourdomain.com`
5. Accept the reCAPTCHA Terms of Service
6. Click **Submit**

7. You'll see two keys displayed:
   - **Site Key**: Used in frontend code (public)
   - **Secret Key**: Used in backend code (keep private!)

## Step 2: Update Environment Variables

Add your reCAPTCHA secret key to your `.env` file:

```env
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

## Step 3: Update Frontend Code

Replace `YOUR_RECAPTCHA_SITE_KEY` in both files with your Site Key:

### In [landing-page/login.js](landing-page/login.js):

- Line with `grecaptcha.execute('YOUR_RECAPTCHA_SITE_KEY', { action: 'login' })`

### In [landing-page/signup.js](landing-page/signup.js):

- Line with `grecaptcha.execute('YOUR_RECAPTCHA_SITE_KEY', { action: 'signup' })`

Example:

```javascript
const token = await grecaptcha.execute(
  "6Le_your_actual_site_key_here", // Replace with your site key
  { action: "login" },
);
```

## Step 4: Install Dependencies

The `axios` package was added to `package.json`. Install it:

```bash
npm install
```

## Step 5: Verify Backend Configuration

Make sure your backend can access the environment variable. Check that your `.env` file is in the root directory of your project (`p:\HearMe\.env`).

## Files Modified

### Frontend Changes:

1. **[landing-page/login.html](landing-page/login.html)**
   - Added reCAPTCHA v3 script tag
   - Added hidden input field for CAPTCHA token

2. **[landing-page/login.js](landing-page/login.js)**
   - Added `getRecaptchaToken()` function
   - Updated login form submission to include CAPTCHA verification

3. **[landing-page/SignUp.html](landing-page/SignUp.html)**
   - Added reCAPTCHA v3 script tag

4. **[landing-page/signup.js](landing-page/signup.js)**
   - Added `getRecaptchaToken()` function
   - Updated signup form submission to include CAPTCHA verification

### Backend Changes:

1. **[utils/captchaVerification.js](utils/captchaVerification.js)** (NEW FILE)
   - Created utility function `verifyCaptcha()` to verify tokens with Google's API
   - Handles score validation (0.3 threshold to detect bots)

2. **[routes/auth.js](routes/auth.js)**
   - Imported CAPTCHA verification utility
   - Updated `/api/auth/login` route to verify CAPTCHA tokens
   - Updated `/api/auth/signup` route to verify CAPTCHA tokens

3. **[package.json](package.json)**
   - Added `axios` dependency for making HTTP requests to Google's reCAPTCHA API

## How It Works

### Frontend Flow:

1. User submits login/signup form
2. `getRecaptchaToken()` is called
3. reCAPTCHA v3 generates a token (invisible to user)
4. Token is sent with the login/signup request

### Backend Flow:

1. Server receives the CAPTCHA token
2. `verifyCaptcha()` sends token to Google's API
3. Google returns a score (0.0-1.0):
   - Higher score = more likely legitimate user
   - Lower score = more likely bot activity
4. If score < 0.3, request is rejected as suspicious
5. Otherwise, login/signup proceeds normally

## Testing

### Local Testing:

When testing locally with `localhost:5000`, make sure:

1. You added `localhost:5000` to your reCAPTCHA domains
2. Your `.env` file has the correct `RECAPTCHA_SECRET_KEY`
3. Frontend code uses the correct Site Key

### Score Debugging:

To see reCAPTCHA scores in your backend logs, uncomment or add:

```javascript
console.log(`CAPTCHA Score: ${score}`, `Action: ${action}`);
```

## Troubleshooting

### "CAPTCHA verification failed"

- Check that `RECAPTCHA_SECRET_KEY` is set in `.env`
- Verify the secret key is correct
- Check browser console for CAPTCHA loading errors

### CAPTCHA script not loading

- Make sure the script tag is in the `<head>` section
- Check that the page is accessible (no 404s)
- Verify reCAPTCHA isn't blocked by ad blockers in your browser

### Users blocked as bots

- The score threshold (0.3) may be too strict for your use case
- You can adjust it in [utils/captchaVerification.js](utils/captchaVerification.js)
- Lower value = more users allowed but more bots get through

## reCAPTCHA v3 vs v2

You're using **reCAPTCHA v3**, which:

- ✅ Invisible to users (no checkbox)
- ✅ Provides a continuous score instead of pass/fail
- ✅ Works seamlessly in the background
- ❌ Slightly less foolproof than v2 (which requires user interaction)

If you need stronger bot protection, consider switching to v2 with the "I'm not a robot" checkbox.

## Production Considerations

Before deploying to production:

1. **Update domains** in reCAPTCHA Admin Console with your production domain
2. **Use environment variables** for both keys (never hardcode them)
3. **Monitor abuse** through Google's Admin Console
4. **Adjust score threshold** based on your security vs. user experience trade-off
5. **Log CAPTCHA scores** for analytics and improvement

## Additional Resources

- [Google reCAPTCHA Documentation](https://developers.google.com/recaptcha)
- [reCAPTCHA v3 Admin Console](https://www.google.com/recaptcha/admin)
- [reCAPTCHA Web API Reference](https://developers.google.com/recaptcha/docs/v3)
