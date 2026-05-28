<<<<<<< HEAD
=======
// Adding simple interactivity to the SOS and Call buttons
>>>>>>> fb42d70 ("user-profiles" "Therapistportal")
document.addEventListener('DOMContentLoaded', () => {
    
    // SOS Button Logic
    const sosButton = document.getElementById('sosButton');
    
    if (sosButton) {
        sosButton.addEventListener('click', () => {
<<<<<<< HEAD
            alert('SOS Activated! Initiating emergency protocols and fetching location...');
            
            // Visual loading state updates
=======
            // In a real application, this would trigger an emergency protocol API
            alert('SOS Activated! Initiating emergency protocols and fetching location...');
            
            // Visual feedback
>>>>>>> fb42d70 ("user-profiles" "Therapistportal")
            sosButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ACTIVATING...';
            sosButton.style.opacity = '0.8';
            
            setTimeout(() => {
                sosButton.innerHTML = 'ACTIVATE SOS';
                sosButton.style.opacity = '1';
            }, 3000);
        });
    }

    // Call Buttons Logic
    const callButtons = document.querySelectorAll('.btn-call');
    
    callButtons.forEach(button => {
        button.addEventListener('click', (e) => {
<<<<<<< HEAD
=======
            // Find the associated phone number in the same card
>>>>>>> fb42d70 ("user-profiles" "Therapistportal")
            const card = e.target.closest('.hotline-card');
            const phoneNumberElement = card.querySelector('.phone-number');
            const phoneNumberText = phoneNumberElement.innerText.trim();
            
            alert(`Opening dialer for: ${phoneNumberText}`);
        });
    });
<<<<<<< HEAD
});

// =========================
// PAGE TRANSITION SYSTEM
// =========================

// Fade IN when page loads
document.addEventListener("DOMContentLoaded", () => {
    document.body.style.opacity = "1";
});

// Handle navigation clicks
document.querySelectorAll("a.nav-item").forEach(link => {
    link.addEventListener("click", function (e) {

        const href = this.getAttribute("href");

        // Only apply to internal links
        if (href && !href.startsWith("#")) {
            e.preventDefault();

            // fade out current page
            document.body.classList.add("fade-out");

            // wait for animation then go
            setTimeout(() => {
                window.location.href = href;
            }, 300); // must match CSS duration
        }
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const trigger = document.getElementById('dropdownTrigger');
    const menu = document.getElementById('dropdownMenu');

    if (trigger && menu) {
        // Toggle menu view when clicking the profile element
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('show');
        });

        // Close menu dynamically if the user clicks anywhere else outside of it
        document.addEventListener('click', (e) => {
            if (!trigger.contains(e.target) && !menu.contains(e.target)) {
                menu.classList.remove('show');
            }
        });
    }
=======
>>>>>>> fb42d70 ("user-profiles" "Therapistportal")
});