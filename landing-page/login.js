document.addEventListener('DOMContentLoaded', () => {

    const roleOptions =
        document.querySelectorAll('.role-option');

    const loadingModal =
        document.getElementById('loadingModal');

    const avatarIcon =
        document.querySelector('.avatar-circle i');

    const forgotPasswordLink =
        document.getElementById('forgotPasswordLink');

    const resetModal =
        document.getElementById('resetModal');

    const closeResetModal =
        document.getElementById('closeResetModal');

    const sendResetPin =
        document.getElementById('sendResetPin');

    const resetPasswordBtn =
        document.getElementById('resetPasswordBtn');

    const resetMessage =
        document.getElementById('resetMessage');

    const loginEmail =
        document.getElementById('email');

    let selectedRole = 'user';

    function setResetMessage(message, type = '') {
        resetMessage.textContent = message;
        resetMessage.className = `reset-message ${type}`.trim();
    }

    /* =========================
       ROLE SWITCHING
    ========================= */

    roleOptions.forEach(option => {

        option.addEventListener('click', () => {

            roleOptions.forEach(opt =>
                opt.classList.remove('active')
            );

            option.classList.add('active');

            selectedRole = option.dataset.role;

            if (selectedRole === 'user') {
                avatarIcon.className = 'fa-solid fa-user';
            } else {
                avatarIcon.className = 'fa-solid fa-user-doctor';
            }
        });
    });

    /* =========================
       PASSWORD RESET
    ========================= */

    forgotPasswordLink.addEventListener('click', (e) => {

        e.preventDefault();

        document.getElementById('resetEmail').value =
            loginEmail.value.trim();

        setResetMessage('');
        resetModal.style.display = 'flex';
        document.getElementById('resetEmail').focus();
    });

    closeResetModal.addEventListener('click', () => {
        resetModal.style.display = 'none';
    });

    resetModal.addEventListener('click', (e) => {
        if (e.target === resetModal) {
            resetModal.style.display = 'none';
        }
    });

    sendResetPin.addEventListener('click', async () => {

        const email = document.getElementById('resetEmail').value.trim();

        if (!email) {
            setResetMessage('Enter your account email first.', 'error');
            return;
        }

        sendResetPin.disabled = true;
        sendResetPin.textContent = 'Sending...';
        setResetMessage('');

        try {
            const response = await fetch(
                'http://localhost:5000/api/auth/request-password-reset',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                }
            );

            const data = await response.json();

            if (response.ok) {
                setResetMessage(data.message, 'success');
                document.getElementById('resetPin').focus();
            } else {
                setResetMessage(data.message || 'Could not send temporary PIN.', 'error');
            }

        } catch (err) {
            console.error(err);
            setResetMessage('Server connection failed while sending PIN.', 'error');
        } finally {
            sendResetPin.disabled = false;
            sendResetPin.textContent = 'Send Temporary PIN';
        }
    });

    resetPasswordBtn.addEventListener('click', async () => {

        const email           = document.getElementById('resetEmail').value.trim();
        const pin             = document.getElementById('resetPin').value.trim();
        const password        = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmNewPassword').value;

        if (!email || !pin || !password || !confirmPassword) {
            setResetMessage('Complete all password reset fields.', 'error');
            return;
        }

        resetPasswordBtn.disabled = true;
        resetPasswordBtn.textContent = 'Resetting...';

        try {
            const response = await fetch(
                'http://localhost:5000/api/auth/reset-password',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, pin, password, confirmPassword })
                }
            );

            const data = await response.json();

            if (response.ok) {
                setResetMessage(data.message, 'success');
                document.getElementById('password').value = '';
                loginEmail.value = email;
                setTimeout(() => { resetModal.style.display = 'none'; }, 1600);
            } else {
                setResetMessage(data.message || 'Could not reset password.', 'error');
            }

        } catch (err) {
            console.error(err);
            setResetMessage('Server connection failed while resetting password.', 'error');
        } finally {
            resetPasswordBtn.disabled = false;
            resetPasswordBtn.textContent = 'Reset Password';
        }
    });

    /* =========================
       LOGIN
    ========================= */

    document.getElementById('login-form')
    .addEventListener('submit', async (e) => {

        e.preventDefault();

        const email    = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        try {
            const response = await fetch(
                'http://localhost:5000/api/auth/login',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ role: selectedRole, email, password })
                }
            );

            const data = await response.json();

            if (response.ok) {

                // ── Save token and user data ──
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('role', data.user.role);
                localStorage.setItem('anonymousName', data.user.anonymousName || '');

                // ── Save identifier for community feed avatar and display name ──
                // Falls back through anonymousName → username → email
                localStorage.setItem(
                    'userIdentifier',
                    data.user.anonymousName || data.user.username || data.user.email || 'U'
                );

                // ── Show loading and redirect ──
                loadingModal.style.display = 'flex';

                setTimeout(() => {
                    if (selectedRole === 'user') {
                        window.location.href = '/user/community';
                    } else {
                        window.location.href = '/therapist/profile';
                    }
                }, 3000);

            } else {
                alert(data.message);
            }

        } catch (err) {
            console.error(err);
            alert('Server connection failed');
        }
    });

});