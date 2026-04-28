document.addEventListener('DOMContentLoaded', () => {
    const roleOptions = document.querySelectorAll('.role-option');
    const anonSection = document.getElementById('anon-section');
    const anonCheckbox = document.getElementById('anonymous');
    const infoBox = document.getElementById('info-box');
    const idLabel = document.getElementById('identifier-label');
    const idInput = document.getElementById('identifier');

    roleOptions.forEach(option => {
        option.addEventListener('click', () => {
            // UI Update: Active state
            roleOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            const role = option.dataset.role;

            if (role === 'user') {
                // User View: Show anon toggle, hide info box
                anonSection.style.display = 'block';
                infoBox.style.display = 'none';
                updateUserView();
            } 
            else if (role === 'therapist') {
                // Therapist View: Hide anon toggle, SHOW info box
                anonSection.style.display = 'none';
                infoBox.style.display = 'block';
                setupProfessionalView("Username", "Choose a username");
            } 
            else if (role === 'admin') {
                // Admin View: Hide anon toggle, HIDE info box
                anonSection.style.display = 'none';
                infoBox.style.display = 'none';
                setupProfessionalView("Admin Username", "Enter admin identifier");
            }
        });
    });

    // Helper to clean up professional input states
    function setupProfessionalView(label, placeholder) {
        idLabel.innerText = label;
        idInput.placeholder = placeholder;
        idInput.value = "";
        idInput.disabled = false;
        idInput.style.backgroundColor = "transparent"; // Ensure it's not grayed out
    }

    function updateUserView() {
        if (anonCheckbox.checked) {
            idLabel.innerText = "Create Anonymous ID";
            idInput.placeholder = "Auto-generated ID";
            idInput.value = "User#" + Math.floor(10000 + Math.random() * 90000);
            idInput.disabled = true;
            idInput.style.backgroundColor = "#f1f5f9"; // Grayed out for auto-gen
        } else {
            idLabel.innerText = "Email Address";
            idInput.placeholder = "Enter your email";
            idInput.value = "";
            idInput.disabled = false;
            idInput.style.backgroundColor = "transparent";
        }
    }

    anonCheckbox.addEventListener('change', updateUserView);
    updateUserView(); // Initialize
});