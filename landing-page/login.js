document.addEventListener('DOMContentLoaded', () => {
    const roleOptions = document.querySelectorAll('.role-option');
    const anonToggleContainer = document.querySelector('.anon-toggle');
    const anonCheckbox = document.getElementById('anonymous');
    const identifierInput = document.getElementById('identifier');

    roleOptions.forEach(option => {
        option.addEventListener('click', () => {
            // UI Update: Active state
            roleOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            const selectedRole = option.dataset.role;

            // Logic: Remove/Hide anon toggle for Admin and Therapist
            if (selectedRole === 'admin' || selectedRole === 'therapist') {
                anonToggleContainer.style.display = 'none';
                anonCheckbox.checked = false; // Uncheck it since they aren't anonymous
                identifierInput.placeholder = "Enter email or username";
                identifierInput.type = "text";
            } else {
                // Show it again for the "User" role
                anonToggleContainer.style.display = 'flex';
                // Reset to default "User" state
                anonCheckbox.checked = true;
                identifierInput.placeholder = "user#12345";
            }
        });
    });

    // Keep your existing checkbox change logic for when the toggle IS visible
    anonCheckbox.addEventListener('change', () => {
        if (anonCheckbox.checked) {
            identifierInput.placeholder = "user#12345";
        } else {
            identifierInput.placeholder = "Enter your email";
        }
    });
});