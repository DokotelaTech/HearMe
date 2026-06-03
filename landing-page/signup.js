const roleOptions =
    document.querySelectorAll('.role-option');

const userFields =
    document.getElementById('user-fields');

const therapistFields =
    document.getElementById('therapist-fields');

let selectedRole = 'user';

const sendVerificationCodeBtn =
    document.getElementById('sendVerificationCode');

const verificationMessage =
    document.getElementById('verificationMessage');

const emailInput =
    document.getElementById('email');

const passwordInput =
    document.getElementById('password');

const confirmPasswordInput =
    document.getElementById('confirmPassword');

const togglePasswordBtn =
    document.getElementById('togglePassword');

const toggleConfirmPasswordBtn =
    document.getElementById('toggleConfirmPassword');

const passwordStrengthContainer =
    document.getElementById('passwordStrengthContainer');

/* =========================================
   CERTIFICATE UPLOAD LOGIC
========================================= */

const certDropzone   = document.getElementById('certDropzone');
const certInput      = document.getElementById('qualificationCertificate');
const certFilePreview= document.getElementById('certFilePreview');
const certFileName   = document.getElementById('certFileName');
const certFileSize   = document.getElementById('certFileSize');
const certRemoveBtn  = document.getElementById('certRemoveBtn');
const certErrorMsg   = document.getElementById('certErrorMsg');
const certDropIcon   = document.getElementById('certDropIcon');
const certDropTitle  = document.getElementById('certDropTitle');

const ALLOWED_TYPES  = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

let selectedCertFile = null;

function formatFileSize(bytes) {
    if (bytes < 1024)       return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function applyCertFile(file) {
    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
        certErrorMsg.textContent = 'Invalid file type. Please upload a PDF, JPG, or PNG.';
        certErrorMsg.classList.add('visible');
        clearCertFile();
        return;
    }
    // Validate size
    if (file.size > MAX_SIZE_BYTES) {
        certErrorMsg.textContent = 'File is too large. Maximum size is 5 MB.';
        certErrorMsg.classList.add('visible');
        clearCertFile();
        return;
    }

    selectedCertFile = file;
    certErrorMsg.classList.remove('visible');
    certDropzone.classList.add('has-file');

    certDropIcon.className = 'fa-solid fa-circle-check';
    certDropTitle.textContent = 'Certificate attached';

    certFileName.textContent = file.name;
    certFileSize.textContent = formatFileSize(file.size);
    certFilePreview.classList.add('visible');
}

function clearCertFile() {
    selectedCertFile = null;
    certInput.value  = '';
    certDropzone.classList.remove('has-file');
    certDropIcon.className  = 'fa-solid fa-cloud-arrow-up';
    certDropTitle.textContent = 'Click or drag & drop your certificate';
    certFilePreview.classList.remove('visible');
    certFileName.textContent = '—';
    certFileSize.textContent = '—';
}

certInput.addEventListener('change', () => {
    if (certInput.files && certInput.files[0]) {
        applyCertFile(certInput.files[0]);
    }
});

certRemoveBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    clearCertFile();
});

// Drag & drop support
certDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    certDropzone.classList.add('dragover');
});
certDropzone.addEventListener('dragleave', () => {
    certDropzone.classList.remove('dragover');
});
certDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    certDropzone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) applyCertFile(file);
});

/* =========================================
   THERAPIST REQUIRED FIELDS VALIDATION
========================================= */

// Map of field id -> user-friendly label
const THERAPIST_REQUIRED_FIELDS = [
    { id: 'firstName',       label: 'First Name' },
    { id: 'lastName',        label: 'Last Name' },
    { id: 'phone',           label: 'Phone Number' },
    { id: 'location',        label: 'Location' },
    { id: 'qualification',   label: 'Qualification' },
    { id: 'licenseNumber',   label: 'License Number' },
    { id: 'institutionName', label: 'Institution Name' },
    { id: 'specialization',  label: 'Specialization' }
];

function validateTherapistFields() {
    const missing = [];

    for (const field of THERAPIST_REQUIRED_FIELDS) {
        const el = document.getElementById(field.id);
        if (!el || !el.value.trim()) {
            missing.push(field.label);
        }
    }

    if (!selectedCertFile) {
        missing.push('Qualification Certificate');
        certErrorMsg.textContent = 'Please upload your qualification certificate.';
        certErrorMsg.classList.add('visible');
    }

    return missing;
}

/* =========================================
   VERIFICATION MESSAGE HELPER
========================================= */

function setVerificationMessage(message, type = '') {
    verificationMessage.textContent = message;
    verificationMessage.className = `verification-message ${type}`.trim();
}

/* =========================================
   PASSWORD REQUIREMENTS VALIDATION
========================================= */

function validatePasswordStrength(password) {
    return {
        length:    password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number:    /\d/.test(password),
        special:   /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
}

function getPasswordStrengthScore(requirements) {
    return Object.values(requirements).filter(Boolean).length;
}

function updatePasswordStrengthUI(password) {
    if (!password) {
        passwordStrengthContainer.style.display = 'none';
        return;
    }

    passwordStrengthContainer.style.display = 'block';

    const requirements = validatePasswordStrength(password);
    const score        = getPasswordStrengthScore(requirements);

    document.getElementById('req-length').classList.toggle('met',  requirements.length);
    document.getElementById('req-upper').classList.toggle('met',   requirements.uppercase);
    document.getElementById('req-lower').classList.toggle('met',   requirements.lowercase);
    document.getElementById('req-number').classList.toggle('met',  requirements.number);
    document.getElementById('req-special').classList.toggle('met', requirements.special);

    const strengthBar  = document.getElementById('passwordStrengthBar');
    const strengthText = document.getElementById('passwordStrengthText');

    strengthBar.className = 'strength-bar';

    if      (score <= 1) { strengthBar.classList.add('weak');       strengthText.textContent = 'Password strength: Weak'; }
    else if (score <= 2) { strengthBar.classList.add('fair');       strengthText.textContent = 'Password strength: Fair'; }
    else if (score <= 3) { strengthBar.classList.add('good');       strengthText.textContent = 'Password strength: Good'; }
    else if (score <= 4) { strengthBar.classList.add('strong');     strengthText.textContent = 'Password strength: Strong'; }
    else                 { strengthBar.classList.add('very-strong');strengthText.textContent = 'Password strength: Very Strong'; }

    strengthBar.style.width = (score / 5) * 100 + '%';
}

/* =========================================
   PASSWORD VISIBILITY TOGGLE
========================================= */

togglePasswordBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const icon = togglePasswordBtn.querySelector('i');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
});

toggleConfirmPasswordBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const icon = toggleConfirmPasswordBtn.querySelector('i');
    if (confirmPasswordInput.type === 'password') {
        confirmPasswordInput.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        confirmPasswordInput.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
});

/* =========================================
   PASSWORD STRENGTH ON INPUT
========================================= */

passwordInput.addEventListener('input', () => {
    updatePasswordStrengthUI(passwordInput.value);
});

/* =========================================
   ROLE SWITCHING
========================================= */

roleOptions.forEach(option => {
    option.addEventListener('click', () => {
        roleOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        selectedRole = option.dataset.role;

        if (selectedRole === 'user') {
            userFields.style.display      = 'block';
            therapistFields.style.display = 'none';
        } else {
            userFields.style.display      = 'none';
            therapistFields.style.display = 'block';
        }
    });
});

/* =========================================
   TERMS MODAL
========================================= */

const modal     = document.getElementById('termsModal');
const openTerms = document.getElementById('openTerms');
const closeModal= document.getElementById('closeModal');

openTerms.addEventListener('click',  () => { modal.style.display = 'flex'; });
closeModal.addEventListener('click', () => { modal.style.display = 'none'; });
window.addEventListener('click',     (e) => { if (e.target === modal) modal.style.display = 'none'; });

/* =========================================
   EMAIL VERIFICATION
========================================= */

sendVerificationCodeBtn.addEventListener('click', async () => {

    const email = emailInput.value.trim();

    if (!email) {
        setVerificationMessage('Enter your email address first.', 'error');
        emailInput.focus();
        return;
    }

    sendVerificationCodeBtn.disabled    = true;
    sendVerificationCodeBtn.textContent = 'Sending...';
    setVerificationMessage('');

    try {
        const response = await fetch('/api/auth/send-verification-code', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
            setVerificationMessage(data.message, 'success');
            document.getElementById('verificationCode').focus();
        } else {
            setVerificationMessage(data.message || 'Could not send verification code.', 'error');
        }

    } catch (err) {
        console.error(err);
        setVerificationMessage('Server error while sending verification code.', 'error');
    } finally {
        sendVerificationCodeBtn.disabled    = false;
        sendVerificationCodeBtn.textContent = 'Send Code';
    }
});

/* =========================================
   SIGNUP
========================================= */

document.getElementById('signup-form').addEventListener('submit', async (e) => {

    e.preventDefault();

    const password        = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    /* ── THERAPIST-SPECIFIC VALIDATION ── */
    if (selectedRole === 'therapist') {
        const missingFields = validateTherapistFields();
        if (missingFields.length > 0) {
            const fieldList = missingFields.join(', ');
            alert(`Please fill in all required therapist fields:\n\n• ${missingFields.join('\n• ')}`);
            return;
        }
    }

    /* ── PASSWORD STRENGTH CHECK ── */
    const requirements = validatePasswordStrength(password);
    const score        = getPasswordStrengthScore(requirements);

    if (score < 3) {
        alert('Password is too weak. Please ensure it meets the requirements.');
        updatePasswordStrengthUI(password);
        return;
    }

    /* ── PASSWORD MATCH CHECK ── */
    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }

    /* ── TERMS CHECK ── */
    if (!document.getElementById('terms').checked) {
        alert('Please accept the Terms & Conditions.');
        return;
    }

    /* ── BUILD FORM DATA (supports file upload) ── */
    const randomNum     = Math.floor(1000 + Math.random() * 9000);
    const anonymousName = `Anonymous#${randomNum}`;

    const struggles = [...document.querySelectorAll('.struggles-grid input:checked')]
        .map(cb => cb.value);

    const formData = new FormData();

    // Common fields
    formData.append('role',             selectedRole);
    formData.append('email',            document.getElementById('email').value.trim());
    formData.append('verificationCode', document.getElementById('verificationCode').value.trim());
    formData.append('password',         password);
    formData.append('confirmPassword',  confirmPassword);
    formData.append('termsAccepted',    'true');

    if (selectedRole === 'user') {
        formData.append('username',     document.getElementById('username')?.value.trim()  || '');
        formData.append('anonymousName',anonymousName);
        formData.append('userPhone',    document.getElementById('userPhone')?.value.trim() || '');
        formData.append('race',         document.getElementById('race')?.value             || '');
        formData.append('struggles',    JSON.stringify(struggles));
    } else {
        formData.append('firstName',       document.getElementById('firstName').value.trim());
        formData.append('lastName',        document.getElementById('lastName').value.trim());
        formData.append('phone',           document.getElementById('phone').value.trim());
        formData.append('location',        document.getElementById('location').value.trim());
        formData.append('qualification',   document.getElementById('qualification').value.trim());
        formData.append('licenseNumber',   document.getElementById('licenseNumber').value.trim());
        formData.append('institutionName', document.getElementById('institutionName').value.trim());
        formData.append('specialization',  document.getElementById('specialization').value.trim());
        // Attach the certificate file
        formData.append('qualificationCertificate', selectedCertFile, selectedCertFile.name);
    }

    try {
        // NOTE: Do NOT set Content-Type header — browser sets it with boundary for multipart/form-data
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            body:   formData
        });

        const data = await response.json();

        if (response.ok) {
            alert('Account created successfully!');
            window.location.href = '/login';
        } else {
            alert(data.message || 'Signup failed. Please try again.');
        }

    } catch (err) {
        console.error(err);
        alert('Server error. Please try again.');
    }
});