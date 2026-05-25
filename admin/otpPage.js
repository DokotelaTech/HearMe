const verifyBtn = document.getElementById('verifyBtn');

verifyBtn.addEventListener('click', verifyOTP);

async function verifyOTP(){

    const otp = document.getElementById('otpInput').value;

    // User email saved after login
    const email = localStorage.getItem('email');

    if(otp === ''){
        document.getElementById('message').innerText = 'Please enter OTP';
        return;
    }

    try{

        const response = await fetch('/verify-otp', {

            method:'POST',

            headers:{
                'Content-Type':'application/json'
            },

            body:JSON.stringify({
                email: email,
                otp: otp
            })

        });

        const data = await response.json();

        if(data.success){

            // Redirect to your system page
            window.location.href = '/dashboard.html';

        }else{

            document.getElementById('message').innerText = data.message;

        }

    }catch(error){

        console.log(error);

        document.getElementById('message').innerText = 'Server Error';

    }

}