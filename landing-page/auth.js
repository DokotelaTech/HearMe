const roleOptions =
    document.querySelectorAll('.role-option');

const userFields =
    document.getElementById('user-fields');

const therapistFields =
    document.getElementById('therapist-fields');

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

        selectedRole = option.dataset.role;

        if(selectedRole === 'user'){

            userFields.style.display = 'block';

            therapistFields.style.display = 'none';

        }else if(selectedRole === 'therapist'){

            userFields.style.display = 'none';

            therapistFields.style.display = 'block';

        }else{

            userFields.style.display = 'none';

            therapistFields.style.display = 'none';
        }

    });

});

/* =========================
   SIGNUP FORM
========================= */

document.getElementById('signup-form')
.addEventListener('submit', async (e) => {

    e.preventDefault();

    const randomNum =
        Math.floor(1000 + Math.random() * 9000);

    const anonymousName =
        `Anonymous#${randomNum}`;

    const struggles =
        [...document.querySelectorAll(
            '.struggles-grid input:checked'
        )]
        .map(cb => cb.value);

    const userData = {

        role:selectedRole,

        email:
            document.getElementById('email').value,

        password:
            document.getElementById('password').value,

        anonymousName,

        struggles,

        firstName:
            document.getElementById('firstName')?.value || "",

        lastName:
            document.getElementById('lastName')?.value || "",

        qualification:
            document.getElementById('qualification')?.value || "",

        institutionName:
            document.getElementById('institutionName')?.value || "",

        location:
            document.getElementById('location')?.value || "",

        specialization:
            document.getElementById('specialization')?.value || ""
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

        const data = await response.json();

        if(response.ok){

            if(selectedRole === 'user'){

                alert(`
Account created successfully!

Your anonymous public name:
${anonymousName}
                `);

            }else{

                alert('Account created successfully!');
            }

            window.location.href = 'login.html';

        }else{

            alert(data.message);
        }

    }catch(err){

        console.log(err);

        alert('Server error');
    }

});