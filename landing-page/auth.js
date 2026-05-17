<<<<<<< HEAD
// signup.js
=======
// auth.js
>>>>>>> testing

document.addEventListener('DOMContentLoaded', () => {
    // 1. UI LOGIC (Role Selection & Toggles)
    const roleOptions = document.querySelectorAll('.role-option');
<<<<<<< HEAD
    const anonToggleContainer = document.getElementById('anon-section'); // Matches signup.html
=======
    const anonToggleContainer = document.getElementById('anon-section'); 
>>>>>>> testing
    const anonCheckbox = document.getElementById('anonymous');
    const identifierInput = document.getElementById('identifier');

    roleOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Update Active state
            roleOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            const selectedRole = option.dataset.role;

            // Hide anon toggle for Admin and Therapist
            if (anonToggleContainer) {
                if (selectedRole === 'admin' || selectedRole === 'therapist') {
                    anonToggleContainer.style.display = 'none';
                    if (anonCheckbox) anonCheckbox.checked = false; 
<<<<<<< HEAD
                    identifierInput.placeholder = "Enter email or username";
                    identifierInput.type = "text";
                } else {
                    anonToggleContainer.style.display = 'block';
                    if (anonCheckbox) anonCheckbox.checked = true;
                    identifierInput.placeholder = "Auto-generated ID";
=======
                    
                    if (identifierInput) {
                        identifierInput.placeholder = "Enter email or username";
                        identifierInput.type = "text";
                    }
                } else {
                    anonToggleContainer.style.display = 'block';
                    if (anonCheckbox) anonCheckbox.checked = true;
                    
                    if (identifierInput) {
                        identifierInput.placeholder = "Auto-generated ID";
                    }
>>>>>>> testing
                }
            }
        });
    });

<<<<<<< HEAD
    if (anonCheckbox) {
=======
    if (anonCheckbox && identifierInput) {
>>>>>>> testing
        anonCheckbox.addEventListener('change', () => {
            if (anonCheckbox.checked) {
                identifierInput.placeholder = "Auto-generated ID";
            } else {
                identifierInput.placeholder = "Enter your email";
            }
        });
    }

    // 2. SIGN UP DATABASE LOGIC
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Stop page refresh

            const roleElement = document.querySelector('.role-option.active');
            const role = roleElement ? roleElement.getAttribute('data-role') : 'user';
            const isAnonymous = anonCheckbox ? anonCheckbox.checked : false;
<<<<<<< HEAD
            const identifier = identifierInput.value;
            const password = document.getElementById('password').value;
=======
            
            // Get values from inputs
            const identifier = identifierInput ? identifierInput.value : '';
            const passwordElement = document.getElementById('password');
            const password = passwordElement ? passwordElement.value : '';

            if (!identifier || !password) {
                alert("Please fill in all fields.");
                return;
            }
>>>>>>> testing

            try {
                const response = await fetch('http://localhost:5000/api/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ role, isAnonymous, identifier, password })
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Signup successful! Redirecting to login...');
                    window.location.href = 'login.html';
                } else {
<<<<<<< HEAD
                    alert(`Error: ${data.message}`);
                }
            } catch (error) {
                console.error('Error connecting to server:', error);
                alert('Could not connect to the server.');
=======
                    alert(`Error: ${data.message || 'Signup failed'}`);
                }
            } catch (error) {
                console.error('Error connecting to server:', error);
                alert('Could not connect to the server. Make sure your backend is running on port 5000.');
>>>>>>> testing
            }
        });
    }
});