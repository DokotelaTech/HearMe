
const verifyForm = document.getElementById('verify-form');

verifyForm.addEventListener('submit', async (e) => {

    e.preventDefault();

    // GET VALUES

    const email =
        document.getElementById('email').value;

    const otp =
        document.getElementById('otp').value;

    try {

        // SEND TO BACKEND

        const response = await fetch(

            'http://localhost:5000/api/auth/verify-otp',

            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    email,
                    otp
                })
            }
        );

        const data = await response.json();

        // SUCCESS

        if (response.ok) {

            alert(data.message);

            // REDIRECT TO LOGIN
            window.location.href = 'login.html';

        } else {

            alert(data.message);

        }

    } catch (error) {

        console.error(error);

        alert('Server error');

    }

});