// Base Database Backend Endpoint Connection Strategy Point
const API_BASE_URL = window.location.origin + '/api';

document.addEventListener('DOMContentLoaded', () => {
    initPasswordToggle();
});

// Password Mask Visibility Switcher
function initPasswordToggle() {
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('adminPassword');

    togglePassword.addEventListener('click', () => {
        // Toggle input masking type attribute
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Switch glyph indicators to display slate status visually
        togglePassword.classList.toggle('fa-eye');
        togglePassword.classList.toggle('fa-eye-slash');
    });
}

// Intercept login submit execution loop
async function handleAdminLogin(event) {
    event.preventDefault(); // Lock default postback refreshes out
    
    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;
    
    const errorBanner = document.getElementById('errorBanner');
    const errorText = document.getElementById('errorText');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnSpinner = document.getElementById('btnSpinner');

    // Clean viewport banner states
    errorBanner.style.display = 'none';

    // UI Loading Transition Trigger
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnSpinner.style.display = 'block';

    try {
        /* --- PRODUCTION DATABASE INTEGRATION PIPELINE ---
           When your backend server container is live, this block executes 
           a real login verification handshake over HTTPS.
        */
        /*
        const response = await fetch(`${API_BASE_URL}/auth/admin-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || "Access verification faulted.");
        }
        
        // Save secure verification parameters (JWT Session Tokens)
        localStorage.setItem('adminToken', result.token);
        window.location.href = 'admin.html';
        return;
        */

        // --- SIMULATED DEVELOPMENT TIMEOUT RESPONSE ---
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Basic frontend logic rule block for initial offline test routing:
        if (email === "admin@hearme.com" && password === "password123") {
            // Authorized -> Route execution path to dashboard layout cleanly
            window.location.href = 'admin.html';
        } else {
            // Validation Mismatch -> Render failure alert modules
            throw new Error("Invalid administrative username or secure keyphrase.");
        }

    } catch (error) {
        // Drop network transaction tracking state variables back to default
        submitBtn.disabled = false;
        btnText.style.display = 'block';
        btnSpinner.style.display = 'none';
        
        // Paint tracking validation failures onto error interface text elements
        errorText.innerText = error.message;
        errorBanner.style.display = 'flex';
    }
}