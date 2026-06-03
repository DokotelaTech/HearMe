# 🔧 Troubleshooting Guide

This guide helps you resolve common issues with the new HearMe features.

---

## 🚨 Common Issues & Solutions

### Issue: "CAPTCHA verification failed" Error

**Symptoms:**

- Error message on login/signup
- Token not being generated
- Server rejects requests

**Solutions:**

1. **Check reCAPTCHA Keys**

   ```bash
   # In .env file, verify these exist:
   RECAPTCHA_SITE_KEY=your_key_here
   RECAPTCHA_SECRET_KEY=your_secret_here
   ```

   - If missing, get keys from: https://www.google.com/recaptcha/admin

2. **Verify Domain Registration**
   - Go to Google reCAPTCHA Console
   - Check "Domain" matches your deployment domain
   - For localhost, add "localhost:5000" or your port

3. **Check Browser Console**
   - Open DevTools (F12)
   - Look for reCAPTCHA errors
   - Common: "reCAPTCHA couldn't find user-provided function"
   - Fix: Ensure `<script src="https://www.google.com/recaptcha/api.js"></script>` is in HTML

4. **Verify Secret Key**
   - Test endpoint: `POST /api/auth/login`
   - Check response: `{ success: false, message: "Invalid secret key" }`
   - If yes, secret key incorrect in .env

5. **Check Network Tab**
   - DevTools → Network tab
   - Look for `siteverify` POST request to Google
   - If failing (403/500), keys are invalid

**Quick Fix:**

```bash
# Restart server after updating .env
npm start
```

---

### Issue: Password Strength Bar Not Updating

**Symptoms:**

- Strength bar doesn't change color while typing
- Requirements checklist doesn't update
- Always shows "Weak" regardless of password

**Solutions:**

1. **Check HTML Structure**
   - Verify `signup.html` has these elements:

   ```html
   <div class="password-strength-container">
     <div class="strength-bar"></div>
     <div class="strength-text"></div>
     <ul class="password-requirements">
       <li id="req-length" class="req-item">...</li>
     </ul>
   </div>
   ```

2. **Check Event Listeners**
   - In DevTools Console, run:

   ```javascript
   document
     .querySelector('input[name="password"]')
     .addEventListener("input", () => console.log("Event fired"));
   ```

   - Type in password field - should log "Event fired"

3. **Verify JavaScript Loaded**
   - Check page source for `signup.js` script tag
   - In DevTools Console, check for errors
   - Run: `typeof validatePasswordStrength` should return "function"

4. **Check CSS**
   - Verify `signup.css` has styles for:

   ```css
   .strength-bar {
     /* should have width transitions */
   }
   .req-item.met {
     color: #22c55e; /* green when met */
   }
   ```

5. **Clear Browser Cache**
   ```bash
   # Hard refresh browser
   Ctrl+Shift+Delete (Windows/Linux)
   Cmd+Shift+Delete (Mac)
   ```

---

### Issue: Password Eye Icon Not Working

**Symptoms:**

- Eye icon present but doesn't toggle visibility
- Clicking doesn't show/hide password
- Page breaks when clicking icon

**Solutions:**

1. **Check Icon HTML**
   - Verify password input has wrapper:

   ```html
   <div class="password-input-wrapper">
     <input type="password" name="password" />
     <button class="toggle-password" type="button">
       <i data-lucide="eye"></i>
     </button>
   </div>
   ```

2. **Verify Event Handler**
   - In `signup.js` or `login.js`, check:

   ```javascript
   document.querySelectorAll(".toggle-password").forEach((btn) => {
     btn.addEventListener("click", (e) => {
       e.preventDefault();
       // Toggle logic here
     });
   });
   ```

3. **Check CSS Positioning**
   - Icon should be positioned absolute:

   ```css
   .password-input-wrapper {
     position: relative;
   }
   .toggle-password {
     position: absolute;
     right: 12px;
     top: 50%;
     transform: translateY(-50%);
   }
   ```

4. **Test Manually**
   - Open DevTools Console
   - Run:
   ```javascript
   document.querySelector(".toggle-password").click();
   ```

   - Should toggle input type between "password" and "text"

---

### Issue: Messages Not Loading

**Symptoms:**

- "No messages" displayed
- Messages list is empty
- Error message appears

**Solutions:**

1. **Check Authentication Token**
   - Open DevTools Console:

   ```javascript
   console.log(localStorage.getItem("token"));
   ```

   - Should return a long JWT token
   - If null: User not logged in

2. **Verify API Endpoint**
   - Network tab → Look for `/api/groups` request
   - Should return 200 status
   - If 401: Token expired or invalid
   - If 404: Endpoint not registered in server.js

3. **Check Message Fetch**
   - Network tab → Look for `/api/groups/[id]/messages`
   - Response should contain `messages` array
   - If empty array: No messages yet (normal)
   - If error: Check group ID is valid

4. **Verify Server Routes**
   - In `server.js`, check:

   ```javascript
   app.use("/api/groups", groupRoutes);
   app.use("/api/messages", messageRoutes);
   ```

   - If missing, routes not available

5. **Check Console for Errors**
   - DevTools → Console tab
   - Look for red error messages
   - Common: "Cannot read property 'messages' of undefined"
   - Fix: Check API response structure

---

### Issue: Can't Join Groups

**Symptoms:**

- "Join Group" button does nothing
- Error message on click
- Page doesn't update after joining

**Solutions:**

1. **Check User Authentication**

   ```javascript
   console.log({
     token: localStorage.getItem("token"),
     role: localStorage.getItem("role"),
     userId: localStorage.getItem("userId"),
   });
   ```

   - Should show: token, role='user', userId

2. **Verify Join Endpoint**
   - Network tab → POST `/api/groups/[id]/join`
   - Should return 200 with success message
   - If 401: Not authenticated
   - If 403: Permission denied

3. **Check Group IDs**
   - Make sure group ID is valid
   - Check group exists in database
   - Run in MongoDB:

   ```javascript
   db.groups.findOne({ _id: ObjectId("id-here") });
   ```

4. **Clear Local State**
   - Reload page: `F5`
   - Clear cache: `Ctrl+Shift+Delete`
   - Log in again

---

### Issue: Messages Sent But Not Appearing

**Symptoms:**

- Send button works but message doesn't show
- No error message displayed
- Other users don't see message

**Solutions:**

1. **Check Message Send Request**
   - Network tab → POST request to `/api/groups/[id]/messages`
   - Should return 200 status
   - Response should contain sent message
   - If 401: Token invalid

2. **Verify Message Format**
   - Request body should be:

   ```json
   { "message": "Your message text" }
   ```

   - Check in Network tab → Request payload

3. **Check Group Membership**
   - User must be group member before sending
   - Run:

   ```javascript
   console.log(joinedGroups);
   ```

   - Should include current group ID

4. **Refresh Message List**
   - After sending, messages auto-reload
   - If not, manually call:
   ```javascript
   openGroupChat(groupId);
   ```

---

### Issue: Call Sessions Not Loading

**Symptoms:**

- "No upcoming sessions" always displayed
- Join button not visible
- Profile doesn't show sessions

**Solutions:**

1. **Verify Route Registration**
   - In `server.js`, check:

   ```javascript
   const appointmentManagementRoutes = require("./routes/appointmentManagementRoutes");
   app.use("/api/session", appointmentManagementRoutes);
   ```

   - If missing: Add it and restart server

2. **Check sessionManager.js Loaded**
   - In `profile.html`, verify:

   ```html
   <script src="sessionManager.js"></script>
   ```

   - Check Network tab → `sessionManager.js` loads (200 status)

3. **Verify API Endpoint**
   - Network tab → GET `/api/session/appointments`
   - Should return 200 with appointments array
   - If 404: Route not registered
   - If 401: Token invalid

4. **Check Database**
   - Verify Appointment model has appointments:

   ```javascript
   db.appointments.find({ userId: ObjectId("user-id") }).count();
   ```

   - If 0: Create test appointment

5. **Check Browser Console**
   - Look for JavaScript errors
   - Common: "Cannot read property 'appointments' of undefined"
   - Fix: Check API response structure

---

### Issue: Can't End Call Session

**Symptoms:**

- "End" button doesn't respond
- No confirmation dialog appears
- Button stays active after clicking

**Solutions:**

1. **Check Button Functionality**
   - Open DevTools Console
   - Run:

   ```javascript
   console.log(document.querySelector("[data-session-id]"));
   ```

   - Should return button element
   - If null: Button not found

2. **Verify End Endpoint**
   - Click End button
   - Network tab → POST `/api/session/appointments/[id]/end`
   - Should return 200
   - If 404: Route not registered
   - If 401: Not authenticated

3. **Check Database Update**
   - After ending, check appointment status:

   ```javascript
   db.appointments.findOne({ _id: ObjectId("id") });
   // Should show: status: "completed", endedAt: Date
   ```

4. **Reload Page**
   - After ending, refresh browser
   - Button should show "✓ Ended" and be disabled
   - If not: Database didn't update

---

### Issue: Disabled "Ended" Button Not Persistent

**Symptoms:**

- Reload page → Button becomes active again
- Can click after session ended
- State not saved

**Solutions:**

1. **Verify Database Update**
   - Check appointment status in database:

   ```javascript
   db.appointments.findOne({ _id: ObjectId("id") });
   ```

   - If `status` is still "scheduled": Update failed

2. **Check Server Logs**
   - Look for errors when ending session
   - Server should update appointment status
   - Check: `console.log` in POST /end endpoint

3. **Verify Page Reload Logic**
   - After reload, `renderUpcomingSessions()` should:
     1. Fetch appointments from `/api/session/appointments`
     2. Check each appointment's `isEnded` property
     3. If true: Disable button and show "✓ Ended"

4. **Manual Test**
   ```javascript
   // In Console
   loadSessionStates().then((apts) => {
     console.log(apts.filter((a) => a.id === "your-id"));
   });
   ```

   - Check `isEnded` property value

---

## 🎯 Quick Debugging Steps

For any issue, follow this process:

### Step 1: Check Browser Console

```
DevTools → Console tab
Look for red errors
Take note of error message
```

### Step 2: Check Network Requests

```
DevTools → Network tab
Perform action that fails
Look for failed requests (red status codes)
Check response body for error message
```

### Step 3: Check Server Logs

```
Terminal where server runs
Look for error messages
Check status codes logged
Note any exceptions
```

### Step 4: Verify Environment

```
Check .env file has all required variables
Check server.js imports all routes
Check HTML files have correct script references
```

### Step 5: Verify Database

```
Connect to MongoDB
Run database queries
Check collections have expected data
Verify indexes on performance-critical fields
```

---

## 📞 Getting Help

If issue persists:

1. **Check Documentation**
   - `IMPLEMENTATION_GUIDE.md` - Technical details
   - `QUICK_START.md` - Setup steps
   - `COMPLETION_SUMMARY.md` - Feature overview

2. **Enable Debug Mode**

   ```javascript
   // In browser console
   localStorage.setItem("debug", "true");
   ```

   - Logs additional information

3. **Capture Full Context**
   - Screenshot of error
   - Browser console errors (copy as text)
   - Network tab requests (copy as cURL)
   - Server logs output
   - `.env` variable names (not values!)

4. **Test in Incognito**
   - DevTools → Incognito/Private window
   - Eliminates cache issues
   - Good for fresh testing

---

## ✅ Prevention Tips

### Keep System Running Smoothly

1. **Regular Monitoring**
   - Check error logs daily
   - Monitor API response times
   - Watch server resource usage

2. **Updates & Maintenance**
   - Keep Node.js updated
   - Update npm packages regularly
   - Run security audits: `npm audit`

3. **Testing**
   - Test features after code changes
   - Use staging environment before production
   - Automated testing for critical flows

4. **Documentation**
   - Keep README updated
   - Document custom configurations
   - Note any workarounds

---

**Still stuck?** The full implementation details are in `IMPLEMENTATION_GUIDE.md`.

Good luck troubleshooting! 🚀
