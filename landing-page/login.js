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

                        window.location.href =
                            '../user-profiles/community-feeds.html';

                    }else{

                        window.location.href =
                            '../Therapistportal/profile.html';
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

});