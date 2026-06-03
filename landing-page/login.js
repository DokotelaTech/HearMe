document.addEventListener('DOMContentLoaded', () => {

    const roleOptions        = document.querySelectorAll('.role-option');
    const loadingModal       = document.getElementById('loadingModal');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const resetModal         = document.getElementById('resetModal');
    const closeResetModal    = document.getElementById('closeResetModal');
    const sendResetPin       = document.getElementById('sendResetPin');
    const resetPasswordBtn   = document.getElementById('resetPasswordBtn');
    const resetMessage       = document.getElementById('resetMessage');
    const loginEmail         = document.getElementById('email');

    let selectedRole = 'user';

    /* =========================
       HELPERS
    ========================= */
    function setResetMessage(message, type = '') {
        resetMessage.textContent = message;
        resetMessage.className = `reset-message ${type}`.trim();
    }

    /* =========================
       PASSWORD VISIBILITY TOGGLE (Reset Modal)
    ========================= */
    const toggleNewPasswordBtn = document.getElementById('toggleNewPassword');
    const toggleConfirmNewPasswordBtn = document.getElementById('toggleConfirmNewPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmNewPasswordInput = document.getElementById('confirmNewPassword');

    if (toggleNewPasswordBtn) {
        toggleNewPasswordBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const icon = toggleNewPasswordBtn.querySelector('i');
            
            if (newPasswordInput.type === 'password') {
                newPasswordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                newPasswordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }

    if (toggleConfirmNewPasswordBtn) {
        toggleConfirmNewPasswordBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const icon = toggleConfirmNewPasswordBtn.querySelector('i');
            
            if (confirmNewPasswordInput.type === 'password') {
                confirmNewPasswordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                confirmNewPasswordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }

    /* =========================
       ROLE SWITCHING
    ========================= */
    roleOptions.forEach(option => {
        option.addEventListener('click', () => {
            roleOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            selectedRole = option.dataset.role;
        });
    });

    /* =========================
       PASSWORD RESET — OPEN MODAL
    ========================= */
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('resetEmail').value = loginEmail.value.trim();
        setResetMessage('');
        resetModal.style.display = 'flex';
        document.getElementById('resetEmail').focus();
    });

    /* Close modal */
    closeResetModal.addEventListener('click', () => {
        resetModal.style.display = 'none';
    });

    resetModal.addEventListener('click', (e) => {
        if (e.target === resetModal) resetModal.style.display = 'none';
    });

    /* =========================
       PASSWORD RESET — SEND PIN
    ========================= */
    sendResetPin.addEventListener('click', async () => {

        const email = document.getElementById('resetEmail').value.trim();

        if (!email) {
            setResetMessage('Enter your account email first.', 'error');
            return;
        }

        sendResetPin.disabled = true;
        sendResetPin.textContent = 'Sending…';
        setResetMessage('');

        try {
            const response = await fetch('/api/auth/request-password-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

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
            sendResetPin.textContent = 'Send PIN';
        }
    });

    /* =========================
       PASSWORD RESET — SUBMIT
    ========================= */
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
        resetPasswordBtn.textContent = 'Resetting…';

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, pin, password, confirmPassword })
            });

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
       LOGIN FORM SUBMIT
    ========================= */
    // FIX: was 'login-form', corrected to match HTML id="loginForm"
    document.getElementById('loginForm').addEventListener('submit', async (e) => {

        e.preventDefault();

        const email    = loginEmail.value.trim();
        const password = document.getElementById('password').value.trim();

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    role: selectedRole, 
                    email, 
                    password
                })
            });

            const data = await response.json();

            if (response.ok) {

                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('role', data.user.role);
                localStorage.setItem('anonymousName', data.user.anonymousName || '');
                localStorage.setItem(
                    'userIdentifier',
                    data.user.anonymousName || data.user.username || data.user.email || 'U'
                );

                loadingModal.style.display = 'flex';

                setTimeout(() => {
                    window.location.href = selectedRole === 'user'
                        ? '/user/community'
                        : '/therapist/profile';
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
