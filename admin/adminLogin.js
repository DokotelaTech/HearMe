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
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        togglePassword.classList.toggle('fa-eye');
        togglePassword.classList.toggle('fa-eye-slash');
    });
}

// Intercept login submit execution loop
async function handleAdminLogin(event) {
    event.preventDefault();

    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;

    const errorBanner = document.getElementById('errorBanner');
    const errorText = document.getElementById('errorText');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnSpinner = document.getElementById('btnSpinner');

    // Clean viewport banner states
    errorBanner.style.display = 'none';

    // UI Loading Transition
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnSpinner.style.display = 'block';

    try {
        const response = await fetch(`${API_BASE_URL}/auth/admin-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Access verification faulted.');
        }

        // Save JWT token and redirect to dashboard
        localStorage.setItem('adminToken', result.token);
        window.location.href = '/admin/dashboard';  // ✅ no .html

    } catch (error) {
        submitBtn.disabled = false;
        btnText.style.display = 'block';
        btnSpinner.style.display = 'none';

        errorText.innerText = error.message;
        errorBanner.style.display = 'flex';
    }
}

