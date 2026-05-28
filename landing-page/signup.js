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

function setVerificationMessage(message, type = '') {
    verificationMessage.textContent = message;
    verificationMessage.className = `verification-message ${type}`.trim();
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
