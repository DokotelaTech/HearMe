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

function setVerificationMessage(message, type = '') {
    verificationMessage.textContent = message;
    verificationMessage.className = `verification-message ${type}`.trim();
}

/* =========================================
   PASSWORD REQUIREMENTS VALIDATION
========================================= */

function validatePasswordStrength(password) {
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };

    return requirements;
}

function getPasswordStrengthScore(requirements) {
    const meetsRequirements = Object.values(requirements).filter(Boolean).length;
    return meetsRequirements;
}

function updatePasswordStrengthUI(password) {
    if (!password) {
        passwordStrengthContainer.style.display = 'none';
        return;
    }

    passwordStrengthContainer.style.display = 'block';

    const requirements = validatePasswordStrength(password);
    const score = getPasswordStrengthScore(requirements);

    // Update requirement indicators
    document.getElementById('req-length').classList.toggle('met', requirements.length);
    document.getElementById('req-upper').classList.toggle('met', requirements.uppercase);
    document.getElementById('req-lower').classList.toggle('met', requirements.lowercase);
    document.getElementById('req-number').classList.toggle('met', requirements.number);
    document.getElementById('req-special').classList.toggle('met', requirements.special);

    // Update strength bar and text
    const strengthBar = document.getElementById('passwordStrengthBar');
    const strengthText = document.getElementById('passwordStrengthText');

    strengthBar.className = 'strength-bar';

    if (score <= 1) {
        strengthBar.classList.add('weak');
        strengthText.textContent = 'Password strength: Weak';
    } else if (score <= 2) {
        strengthBar.classList.add('fair');
        strengthText.textContent = 'Password strength: Fair';
    } else if (score <= 3) {
        strengthBar.classList.add('good');
        strengthText.textContent = 'Password strength: Good';
    } else if (score <= 4) {
        strengthBar.classList.add('strong');
        strengthText.textContent = 'Password strength: Strong';
    } else {
        strengthBar.classList.add('very-strong');
        strengthText.textContent = 'Password strength: Very Strong';
    }

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
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
});

toggleConfirmPasswordBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const icon = toggleConfirmPasswordBtn.querySelector('i');
    
    if (confirmPasswordInput.type === 'password') {
        confirmPasswordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        confirmPasswordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
});

/* =========================================
   PASSWORD STRENGTH ON INPUT
========================================= */

passwordInput.addEventListener('input', () => {
    updatePasswordStrengthUI(passwordInput.value);
});

/* =========================================
   RECAPTCHA TOKEN GENERATION
========================================= */

async function getRecaptchaToken() {
    try {
        if (typeof grecaptcha === 'undefined') {
            console.warn('reCAPTCHA not loaded');
            return null;
        }

        const token = await grecaptcha.execute(
            'YOUR_RECAPTCHA_SITE_KEY', // Replace with your site key
            { action: 'signup' }
        );
        return token;
    } catch (error) {
        console.error('Error getting reCAPTCHA token:', error);
        return null;
    }
}

/* =========================================
   ROLE SWITCHING
========================================= */

roleOptions.forEach(option => {

    option.addEventListener('click', () => {

        roleOptions.forEach(opt =>
            opt.classList.remove('active')
        );

        option.classList.add('active');

        selectedRole = option.dataset.role;

        if(selectedRole === 'user'){

            userFields.style.display = 'block';

            therapistFields.style.display = 'none';

        }else{

            userFields.style.display = 'none';

            therapistFields.style.display = 'block';
        }

    });

});

/* =========================================
   TERMS MODAL
========================================= */

const modal =
    document.getElementById('termsModal');

const openTerms =
    document.getElementById('openTerms');

const closeModal =
    document.getElementById('closeModal');

openTerms.addEventListener('click', () => {

    modal.style.display = 'flex';

});

closeModal.addEventListener('click', () => {

    modal.style.display = 'none';

});

window.addEventListener('click', (e) => {

    if(e.target === modal){

        modal.style.display = 'none';
    }
});

/* =========================================
   EMAIL VERIFICATION
========================================= */

sendVerificationCodeBtn.addEventListener('click', async () => {

    const email =
        emailInput.value.trim();

    if(!email){

        setVerificationMessage(
            'Enter your email address first.',
            'error'
        );

        emailInput.focus();

        return;
    }

    sendVerificationCodeBtn.disabled = true;
    sendVerificationCodeBtn.textContent = 'Sending...';
    setVerificationMessage('');

    try{

        const response = await fetch(
            'http://localhost:5000/api/auth/send-verification-code',
            {
                method:'POST',

                headers:{
                    'Content-Type':'application/json'
                },

                body:JSON.stringify({ email })
            }
        );

        const data =
            await response.json();

        if(response.ok){

            setVerificationMessage(
                data.message,
                'success'
            );

            document.getElementById('verificationCode').focus();

        }else{

            setVerificationMessage(
                data.message || 'Could not send verification code.',
                'error'
            );
        }

    }catch(err){

        console.log(err);

        setVerificationMessage(
            'Server error while sending verification code.',
            'error'
        );

    }finally{

        sendVerificationCodeBtn.disabled = false;
        sendVerificationCodeBtn.textContent = 'Send Code';
    }
});

/* =========================================
   SIGNUP
========================================= */

document.getElementById('signup-form')
.addEventListener('submit', async (e) => {

    e.preventDefault();

    const password =
        document.getElementById('password').value;

    const confirmPassword =
        document.getElementById('confirmPassword').value;

    /* PASSWORD STRENGTH CHECK */

    const requirements = validatePasswordStrength(password);
    const score = getPasswordStrengthScore(requirements);

    if (score < 3) {
        alert('Password is too weak. Please ensure it meets all requirements.');
        updatePasswordStrengthUI(password);
        return;
    }

    /* PASSWORD CHECK */

    if(password !== confirmPassword){

        alert('Passwords do not match');

        return;
    }

    /* TERMS CHECK */

    const termsAccepted =
        document.getElementById('terms').checked;

    if(!termsAccepted){

        alert('Please accept Terms & Conditions');

        return;
    }

    /* GET RECAPTCHA TOKEN */

    const recaptchaToken = await getRecaptchaToken();
    if (!recaptchaToken) {
        alert('CAPTCHA verification failed. Please try again.');
        return;
    }

    /* RANDOM ANONYMOUS NAME */

    const randomNum =
        Math.floor(1000 + Math.random() * 9000);

    const anonymousName =
        `Anonymous#${randomNum}`;

    /* STRUGGLES */

    const struggles =
        [...document.querySelectorAll(
            '.struggles-grid input:checked'
        )]
        .map(cb => cb.value);

    /* USER DATA */

    const userData = {

        role:selectedRole,

        email:
            document.getElementById('email').value.trim(),

        verificationCode:
            document.getElementById('verificationCode').value.trim(),

        password,

        confirmPassword,

        termsAccepted,

        recaptchaToken,

        /* USER */

        username:
            document.getElementById('username')?.value.trim() || "",

        anonymousName,

        userPhone:
            document.getElementById('userPhone')?.value.trim() || "",

        race:
            document.getElementById('race')?.value || "",

        struggles,

        /* THERAPIST */

        firstName:
            document.getElementById('firstName')?.value.trim() || "",

        lastName:
            document.getElementById('lastName')?.value.trim() || "",

        phone:
            document.getElementById('phone')?.value.trim() || "",

        qualification:
            document.getElementById('qualification')?.value.trim() || "",

        licenseNumber:
            document.getElementById('licenseNumber')?.value.trim() || "",

        institutionName:
            document.getElementById('institutionName')?.value.trim() || "",

        specialization:
            document.getElementById('specialization')?.value.trim() || "",

        location:
            document.getElementById('location')?.value.trim() || ""
    };

    try{

        const response = await fetch(
            'http://localhost:5000/api/auth/signup',
            {
                method:'POST',

                headers:{
                    'Content-Type':'application/json'
                },

                body:JSON.stringify(userData)
            }
        );

        const data =
            await response.json();

        if(response.ok){
            alert('Account created successfully!');
            window.location.href =
                '/login';
        }else{
            alert(data.message);
        }
    }catch(err){
        console.log(err);
        alert('Server error');
    }
});
