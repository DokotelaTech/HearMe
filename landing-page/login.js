<<<<<<< HEAD
document.addEventListener('DOMContentLoaded', () => {

    const roleOptions =
        document.querySelectorAll('.role-option');

    const loadingModal =
        document.getElementById('loadingModal');

    const avatarIcon =
        document.querySelector('.avatar-circle i');

    let selectedRole = 'user';

    /* =========================
       ROLE SWITCHING
    ========================= */

    roleOptions.forEach(option => {

        option.addEventListener('click', () => {

            roleOptions.forEach(opt =>
                opt.classList.remove('active')
            );

            option.classList.add('active');

            selectedRole =
                option.dataset.role;

            /* CHANGE AVATAR */

            if(selectedRole === 'user'){

                avatarIcon.className =
                    'fa-solid fa-user';

            }else{

                avatarIcon.className =
                    'fa-solid fa-user-doctor';
            }

        });

    });

    /* =========================
       LOGIN
    ========================= */

    document.getElementById('login-form')
    .addEventListener('submit', async (e) => {

        e.preventDefault();

        const email =
            document.getElementById('email')
            .value
            .trim();

        const password =
            document.getElementById('password')
            .value
            .trim();

        try{

            const response = await fetch(
                'http://localhost:5000/api/auth/login',
                {
                    method:'POST',

                    headers:{
                        'Content-Type':'application/json'
                    },

                    body:JSON.stringify({
                        role:selectedRole,
                        email,
                        password
                    })
                }
            );

            const data =
                await response.json();

            if(response.ok){

                /* SAVE USER AND TOKEN */
                // This is the line theProfile.js was desperately looking for:
                localStorage.setItem(
                    'user', 
                    JSON.stringify(data.user)
                );

                localStorage.setItem(
                    'token',
                    data.token
                );

                localStorage.setItem('userIdentifier', data.user.identifier);

                // Kept these just in case your other pages rely on them
                localStorage.setItem(
                    'role',
                    data.user.role
                );

                localStorage.setItem(
                    'anonymousName',
                    data.user.anonymousName || ''
                );

                /* SHOW LOADING */

                loadingModal.style.display = 'flex';


                setTimeout(() => {

                    if(selectedRole === 'user'){

                        window.location.href = '/user/community';

                    }else{

                        window.location.href = '/therapist/profile';
                    }

                }, 3000);

            }else{

                alert(data.message); 
            }

        }catch(err){

            console.log(err);

            alert('Server connection failed');
        }

    });

=======
// login.js
document.addEventListener('DOMContentLoaded', () => {
    // 1. UI LOGIC (Role Selection)
    const roleOptions = document.querySelectorAll('.role-option');
    const anonToggleContainer = document.querySelector('.anon-toggle');
    const anonCheckbox = document.getElementById('anonymous');
    const identifierInput = document.getElementById('identifier');

    roleOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Update Active state
            roleOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            const selectedRole = option.dataset.role;

            if (anonToggleContainer) {
                if (selectedRole === 'admin' || selectedRole === 'therapist') {
                    anonToggleContainer.style.display = 'none';
                    if (anonCheckbox) anonCheckbox.checked = false; 
                    if (identifierInput) identifierInput.placeholder = "Enter email or username";
                } else {
                    anonToggleContainer.style.display = 'flex';
                    if (anonCheckbox) anonCheckbox.checked = true;
                    if (identifierInput) identifierInput.placeholder = "user#12345";
                }
            }
        });
    });

    if (anonCheckbox && identifierInput) {
        anonCheckbox.addEventListener('change', () => {
            if (anonCheckbox.checked) {
                identifierInput.placeholder = "user#12345";
            } else {
                identifierInput.placeholder = "Enter your email";
            }
        });
    }

    // 2. LOGIN DATABASE LOGIC
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 

            // Safety check for inputs
            const passwordInput = document.getElementById('password');
            if (!identifierInput || !passwordInput) {
                alert("Critical Error: Form inputs not found.");
                return;
            }

            const roleElement = document.querySelector('.role-option.active');
            const role = roleElement ? roleElement.getAttribute('data-role') : 'user';
            const identifier = identifierInput.value;
            const password = passwordInput.value;

            try {
                const response = await fetch('http://localhost:5000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ role, identifier, password })
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Login successful! Welcome back to HearMe.');
                    
                    // Save secure token and user info to browser
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userRole', data.user.role);
                    localStorage.setItem('userIdentifier', data.user.identifier);

                    // Redirect to the main dashboard
                    window.location.href = '../user-profiles/community-feeds.html'; 
                } else {
                    alert(`Login failed: ${data.message}`);
                }
            } catch (error) {
                console.error('Error connecting to server:', error);
                alert('Could not connect to the server. Is your backend running?');
            }
        });
    }
>>>>>>> 8bfd832 (project)
});