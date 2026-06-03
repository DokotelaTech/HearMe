# HearMe Setup Quick Start

## Environment Variables Required

Add these to your `.env` file:

```
# Google reCAPTCHA v3
RECAPTCHA_SITE_KEY=your_site_key_from_google_console
RECAPTCHA_SECRET_KEY=your_secret_key_from_google_console

# Existing variables (if not already set)
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

## Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Get reCAPTCHA Keys**
   - Visit: https://www.google.com/recaptcha/admin
   - Click "Create" or "+" button
   - Set it up for reCAPTCHA v3
   - Copy keys to `.env`

3. **Start server**
   ```bash
   npm start
   ```

## Key Features

### 1. CAPTCHA Protection

- Automatically protects login & signup
- No user interaction needed (invisible)
- Blocks bots with score < 0.3

### 2. Password Strength

- Requires at least 3 of 5 criteria:
  - 8+ characters
  - Uppercase letter
  - Lowercase letter
  - Number
  - Special character (!@#$%^&\*)
- Real-time visual feedback on signup

### 3. Group Messaging

- Users can browse and join groups
- WhatsApp-style message interface
- Separate tabs: Therapists | Groups
- Purple bubbles for user messages

### 4. Call Session Management

- Join/End buttons on profile sessions
- Button disabled after session ends
- Shows "✓ Ended" to prevent rejoin

## Testing

### Test Login with CAPTCHA

```
Navigate to: /login
Email: test@example.com
Password: TestPassword123!
Should show "CAPTCHA verification failed" if no token (normal)
```

### Test Signup with Password Strength

```
Navigate to: /signup
Try password: "weak" (fails)
Try password: "MyPass123!" (passes - 5 criteria)
Watch strength bar change in real-time
```

### Test Groups

```
Navigate to: /user/groups.html
Click "Join Group" on any group
Click "Open Chat" to view messages
Type and send a message (should be purple)
```

### Test Call Sessions

```
Navigate to: /user/profile.html
Scroll to "Upcoming Sessions"
Click "Join Call" → Video modal opens
Click "End" → Button changes to "✓ Ended"
Reload page → Button still shows "✓ Ended"
```

## Common Issues

### reCAPTCHA not working

- [ ] Check site key in HTML: `<script src="https://www.google.com/recaptcha/api.js"></script>`
- [ ] Verify RECAPTCHA_SECRET_KEY in .env
- [ ] Check browser console for errors
- [ ] Verify domain matches Google Console settings

### Password validation failing

- [ ] Special characters supported: !@#$%^&\*
- [ ] Password must be exactly 8+ characters
- [ ] Server requires minimum score of 3/5

### Messages not loading

- [ ] Check user is authenticated (token in localStorage)
- [ ] Verify /api/groups endpoint working
- [ ] Check browser Network tab for 401/403 errors

### Call button not disabled

- [ ] Verify appointmentManagementRoutes imported in server.js
- [ ] Check database Appointment model has 'status' field
- [ ] Verify session ends properly (POST /api/session/appointments/:id/end)

## File Map

```
Landing (Public):
├── login.html - Login form (CAPTCHA enabled)
├── SignUp.html - Signup form (Password strength enabled)
└── messages.html - Messaging interface (Tab-based)

User Portal:
├── profile.html - User dashboard (Call sessions)
├── groups.html - Group browser
└── messages.html - Group chat access

Routes:
├── auth.js - Authentication with CAPTCHA
├── messageRoutes.js - Therapist messaging
├── groupRoutes.js - Group management
└── appointmentManagementRoutes.js - Call sessions

Utilities:
└── captchaVerification.js - reCAPTCHA validation
```

## Next Steps

1. Replace placeholder environment variables
2. Run `npm start`
3. Test each feature using the testing guide above
4. Deploy to production

For detailed information, see: `IMPLEMENTATION_GUIDE.md`
