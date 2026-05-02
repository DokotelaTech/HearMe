emailjs.init({
    publicKey: "", // PUBLIC KEY 
});

// 2. Wait for the page to load, then attach the form listener
document.addEventListener('DOMContentLoaded', () => {
    const cancelForm = document.getElementById('cancelForm');
    
    // Only run this if we are actually on the cancel-sub page
    if (cancelForm) {
        cancelForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = document.getElementById('userEmail').value;
            handleCancellation(emailInput);
        });
    }
});

// 3. The function that triggers the email
function handleCancellation(userEmail) {
    const btn = document.querySelector('.btn-cancel');
    btn.innerText = "Sending...";
    btn.disabled = true; // Prevents the user from clicking twice

    let templateParams = {
        email: userEmail 
    };

    // I HAVE INCLUDED YOUR SPECIFIC IDs HERE
    emailjs.send('service_zk8dlso', 'template_5ipjpk7', templateParams)
        .then(function(response) {
            console.log('SUCCESS!', response.status, response.text);
            alert("Success! A cancellation confirmation has been sent to " + userEmail);
            
            // Set the user status to basic in localStorage
            localStorage.setItem('userStatus', 'basic');
            
            // Redirect back to profile
            window.location.href = 'profile.html';
        }, function(error) {
            console.log('FAILED...', error);
            alert("Oops! Something went wrong. Please try again.");
            
            // Reset the button so they can try again
            btn.innerText = "Confirm Cancellation";
            btn.disabled = false;
        });
}

// modal part
function showModal()
{
    document.getElementById("myModal").style.display = "block";
}

function closeModal()
{
    document.getElementById("myModal").style.display = "none";
}