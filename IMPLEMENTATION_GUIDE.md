# HearMe Group Messaging & Call Session Management - Implementation Guide

## Overview

This document outlines the complete implementation of three major features for the HearMe application:

1. **Google reCAPTCHA v3** - Bot protection on authentication flows
2. **Password Security** - Strong password validation with real-time strength indicators
3. **Group Messaging System** - WhatsApp-style group chat with call session state management

---

## Feature 1: CAPTCHA Protection

### Files Modified/Created

- `utils/captchaVerification.js` - Server-side verification
- `routes/auth.js` - CAPTCHA validation on login/signup
- `landing-page/login.html` - Added reCAPTCHA script
- `landing-page/login.js` - Added token generation
- `landing-page/SignUp.html` - Added reCAPTCHA script
- `landing-page/signup.js` - Added token generation
- `package.json` - Added axios dependency

### Setup Instructions

1. **Get Google reCAPTCHA v3 Keys**
   - Go to https://www.google.com/recaptcha/admin
   - Create new reCAPTCHA v3 key
   - Copy Site Key and Secret Key

2. **Update Environment Variables** (`.env`)

   ```
   RECAPTCHA_SITE_KEY=your_site_key_here
   RECAPTCHA_SECRET_KEY=your_secret_key_here
   ```

3. **Frontend Implementation**
   - reCAPTCHA script automatically loads in login/signup pages
   - Token generated on form submission
   - Sent with login/signup request

4. **Backend Verification**
   - Server validates token via `verifyCaptcha(token)`
   - Scores < 0.3 rejected as suspicious
   - All bot attempts blocked

---

## Feature 2: Password Security & Strength Validation

### Features Implemented

1. **Password Strength Requirements** (5 criteria, minimum 3 required)
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
   - At least one special character (!@#$%^&\*)

2. **Real-time Visual Feedback**
   - Live strength bar with color coding:
     - **Weak** (red): 1-2 requirements met
     - **Fair** (orange): 3 requirements met
     - **Good** (yellow): 3 requirements met
     - **Strong** (light green): 4 requirements met
     - **Very Strong** (green): All 5 requirements met

3. **Password Visibility Toggle**
   - Eye icon button to show/hide password
   - Works on signup page and login password reset modal
   - Smooth animation on toggle

### Files Modified

- `landing-page/signup.js` - Password validation & strength calculation
- `landing-page/signup.css` - Strength bar styling
- `landing-page/login.js` - Password reset toggle functionality
- `landing-page/login.css` - Input wrapper styling
- `routes/auth.js` - Server-side validation (minimum score 3)

### Client-Side Validation

```javascript
// In signup.js
function validatePasswordStrength(password) {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*]/.test(password),
  };
}

function getPasswordStrengthScore(requirements) {
  return Object.values(requirements).filter(Boolean).length;
}
```

### Server-Side Validation

```javascript
// In routes/auth.js
if (score < 3) {
  return res.status(400).json({
    message:
      "Password is too weak. Please use at least 3 of: uppercase, lowercase, number, special character",
  });
}
```

---

## Feature 3: Group Messaging System

### Architecture

The system supports **dual messaging**:

- **Therapist Messages** - 1-on-1 user-therapist chats
- **Group Messages** - Multi-user group chats (WhatsApp style)

### Key Components

#### Frontend Files

1. **landing-page/messages.html**
   - Tab system: "Therapists" | "Groups"
   - Dual inbox lists (therapist-inbox-list, group-inbox-list)
   - Chat display area
   - Message input

2. **landing-page/messages.js** (~400 lines)
   - `loadTherapistInbox()` - Fetches therapist conversations
   - `loadGroupInbox()` - Fetches user's groups
   - `switchTab(tabName)` - Switches between tabs
   - `renderTherapistChat(messages)` - Renders 1-on-1 chats
   - `renderGroupChat(messages)` - Renders group chats
   - `sendMessage()` - Routes to correct endpoint

3. **landing-page/messages.css**
   - Tab styling with active states
   - WhatsApp-style message bubbles:
     - User messages: Purple (#9333ea), right-aligned
     - Other messages: White, left-aligned with sender name
     - Border-radius differentiation (4px vs 18px)

4. **user-profiles/groups.js** (~200 lines)
   - `loadGroups()` - Fetches all available groups
   - `renderGroupsGrid()` - Shows group cards with join/chat buttons
   - `joinGroup(groupId)` - Adds user to group
   - `openGroupChat(groupId)` - Loads and displays group messages
   - `sendMessage()` - Sends group message

5. **user-profiles/groups.css**
   - Enhanced group card styling
   - Avatar badges
   - WhatsApp-style message rendering
   - Filter buttons for group categories

#### Backend Files

1. **routes/groupRoutes.js** (existing)
   - `GET /api/groups` - List all groups
   - `POST /api/groups/:id/join` - Join group
   - `GET /api/groups/:id/messages` - Get group messages
   - `POST /api/groups/:id/messages` - Send group message

2. **routes/messageRoutes.js** (existing)
   - `GET /api/messages/user-inbox` - Get therapist conversations
   - `POST /api/messages/therapist/:id` - Send therapist message

### Message Data Structure

**Therapist Messages**

```javascript
{
    _id: ObjectId,
    content: "Message text",
    createdAt: Date,
    senderId: ObjectId,
    senderRole: "user" | "therapist"
}
```

**Group Messages**

```javascript
{
    _id: ObjectId,
    message: "Message text",
    senderId: ObjectId,
    senderName: "User Name",
    createdAt: Date
}
```

### UI Display

#### WhatsApp-Style Messages

```
┌─────────────────────────┐
│       User's Message    │  ← Purple background, right-aligned
│       12:34 PM          │
└─────────────────────────┘

┌─────────────────────────┐
│ Therapist Name          │  ← Sender name (for group/other)
│ Their Message           │  ← White background, left-aligned
│ 12:35 PM                │
└─────────────────────────┘
```

### Group Integration Flow

1. **Browse Groups** → `groups.html`
2. **Join Group** → `POST /api/groups/:id/join`
3. **Open Chat** → Navigate to `messages.html` with group selected
4. **View Messages** → `GET /api/groups/:id/messages`
5. **Send Message** → `POST /api/groups/:id/messages`

---

## Feature 4: Call Session State Management

### New Routes

**File**: `routes/appointmentManagementRoutes.js`

1. **GET /api/session/appointments**
   - Returns all user appointments with status
   - Fields: id, date, status, therapistName, isEnded

2. **POST /api/session/appointments/:id/end**
   - Marks appointment as completed
   - Sets endedAt timestamp
   - Returns isEnded: true

3. **GET /api/session/appointments/:id/can-join**
   - Checks if session is still joinable
   - Returns canJoin boolean and meetingLink
   - Prevents joining ended sessions

### Frontend Implementation

**File**: `user-profiles/sessionManager.js`

Key Functions:

```javascript
async function loadSessionStates()           // Load appointments from backend
async function endCallSession(appointmentId) // Mark session as ended
async function canJoinSession(appointmentId) // Check if user can join
function updateSessionButtonState()          // Update UI button state
async function renderUpcomingSessions()      // Render session list
async function handleJoinCall()              // Open video modal
async function handleEndCall()               // End session
```

### Profile Integration

**File**: `user-profiles/profile.html`

- Updated "Upcoming Sessions" section
- Shows active sessions with Join/End buttons
- Displays session therapist name and time

**File**: `user-profiles/profile.css\*\*

- `.session-item` - Session card styling
- `.btn-join-call` - Purple join button
- `.btn-end-call` - Red end button
- `.btn-session-ended` - Disabled gray button (after session ends)
- `.status-active` / `.status-ended` - Status indicators

### Session Flow

1. **User loads profile** → `renderUpcomingSessions()` loads appointments
2. **User clicks Join** → `handleJoinCall()` opens video modal
3. **Call is active** → Join/End buttons visible
4. **User ends session** → `handleEndCall()` → `POST /api/session/appointments/:id/end`
5. **Session marked complete** → Button disabled, shows "✓ Ended"
6. **User can't rejoin** → `canJoinSession()` returns false

---

## Server Configuration

### Updated: `server.js`

```javascript
// Added import
const appointmentManagementRoutes = require("./routes/appointmentManagementRoutes");

// Register routes
app.use("/api/session", appointmentManagementRoutes);
```

### Database Models Used

- `Appointment` - Stores appointment/session data
- `Group` - Stores group information
- `GroupMessage` - Stores group messages
- `Message` - Stores therapist-user messages
- `User` - User accounts

---

## File Structure

```
HearMe/
├── routes/
│   ├── appointmentManagementRoutes.js (NEW)
│   ├── auth.js (UPDATED - CAPTCHA + Password validation)
│   ├── groupRoutes.js (existing)
│   ├── messageRoutes.js (existing)
│   └── ...
├── utils/
│   ├── captchaVerification.js (NEW)
│   └── ...
├── landing-page/
│   ├── login.html (UPDATED)
│   ├── login.js (UPDATED)
│   ├── login.css (UPDATED)
│   ├── SignUp.html (UPDATED)
│   ├── signup.js (UPDATED)
│   ├── signup.css (UPDATED)
│   ├── messages.html (UPDATED)
│   ├── messages.js (REWRITTEN)
│   ├── messages.css (UPDATED)
│   └── ...
├── user-profiles/
│   ├── profile.html (UPDATED)
│   ├── profile.js (unchanged)
│   ├── profile.css (UPDATED)
│   ├── groups.html (UPDATED)
│   ├── groups.js (REWRITTEN)
│   ├── groups.css (UPDATED)
│   ├── sessionManager.js (NEW)
│   └── ...
└── server.js (UPDATED)
```

---

## Testing Checklist

### CAPTCHA

- [ ] Attempt login with no activity (should generate valid token)
- [ ] Verify token sent in request body
- [ ] Check backend score validation (< 0.3 rejected)
- [ ] Test with multiple rapid submissions

### Password Security

- [ ] Signup with weak password → Should show error
- [ ] Watch real-time strength bar update
- [ ] Toggle password visibility on both signup and reset
- [ ] Verify server-side validation on signup

### Group Messaging

- [ ] Load groups page → See all available groups
- [ ] Join group → Button changes to "Joined"
- [ ] Open group chat → See previous messages
- [ ] Send message → Message appears with purple background
- [ ] Receive message from other user → Appears with white background
- [ ] Switch between Therapists/Groups tabs

### Call Sessions

- [ ] Load profile → See upcoming sessions
- [ ] Click Join Call → Video modal opens
- [ ] Click End → Modal closes, button becomes "✓ Ended"
- [ ] Reload profile → Button still shows "✓ Ended"
- [ ] Try to join ended session → Button disabled

---

## API Endpoints Reference

### Authentication (Routes: `/api/auth/`)

- `POST /login` - Login with CAPTCHA token
- `POST /signup` - Signup with CAPTCHA token (requires strong password)
- `POST /send-verification-code` - Send email verification

### Messages (Routes: `/api/messages/`)

- `GET /user-inbox` - Get therapist conversations
- `POST /therapist/:id` - Send message to therapist

### Groups (Routes: `/api/groups/`)

- `GET /` - List all groups
- `POST /:id/join` - Join group
- `GET /:id/messages` - Get group messages
- `POST /:id/messages` - Send group message

### Call Sessions (Routes: `/api/session/`)

- `GET /appointments` - Get user's appointments
- `POST /appointments/:id/end` - End session
- `GET /appointments/:id/can-join` - Check if user can join

---

## Troubleshooting

### reCAPTCHA Issues

- **Token not generating**: Check console for errors, verify site key is correct
- **"CAPTCHA verification failed"**: Check secret key in .env, verify token format

### Password Validation Issues

- **Strength bar not updating**: Check password.js event listeners on input change
- **Server rejects valid password**: Verify score calculation logic matches requirements

### Messaging Issues

- **Messages not loading**: Check API endpoints accessible, verify authentication token
- **Messages appear as wrong sender**: Verify senderId/senderRole in message objects
- **Tab switching broken**: Check tab button event listeners, verify currentChatType state

### Call Session Issues

- **"Ended" button not showing**: Verify appointmentManagementRoutes imported in server.js
- **Can still join after ending**: Check `canJoinSession()` logic, verify status field updated
- **Sessions not loading**: Check appointment model populated correctly, token valid

---

## Future Enhancements

1. **Video Call Integration**
   - Real-time video using WebRTC or Daily.co
   - Screen sharing in group sessions
   - Recording capabilities

2. **Group Features**
   - Group admins/moderators
   - Pinned messages
   - Group notifications
   - File sharing

3. **Message Features**
   - Message reactions/emojis
   - Typing indicators
   - Message search
   - Message history export

4. **Security**
   - Rate limiting on CAPTCHA attempts
   - 2FA authentication
   - End-to-end encryption for messages

---

## Support

For issues or questions about implementation:

1. Check the troubleshooting section
2. Verify all environment variables are set correctly
3. Check browser console for JavaScript errors
4. Verify backend routes are registered in `server.js`
5. Check database models have required fields

---

**Last Updated**: 2024
**Version**: 1.0
**Status**: Production Ready
