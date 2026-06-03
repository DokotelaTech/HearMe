document.addEventListener('DOMContentLoaded', () => {
    
    // SOS Button Logic
    const sosButton = document.getElementById('sosButton');
    
    if (sosButton) {
        sosButton.addEventListener('click', async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please log in before activating SOS.');
                window.location.href = '/login';
                return;
            }

            sosButton.disabled = true;
            sosButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ACTIVATING...';
            sosButton.style.opacity = '0.8';

            try {
                const response = await fetch('/api/appointments/emergency', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        note: 'Emergency SOS request from client. Immediate online support needed.'
                    })
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Failed to activate SOS');

                sosButton.innerHTML = '<i class="fa-solid fa-circle-check"></i> SOS SENT';
                sosButton.style.opacity = '1';
                alert(`SOS sent to ${data.count || 'available'} therapist(s). Please keep this page open and check your sessions.`);
            } catch (error) {
                alert(error.message || 'SOS activation failed. Please call emergency services immediately.');
                sosButton.disabled = false;
                sosButton.innerHTML = 'ACTIVATE SOS';
                sosButton.style.opacity = '1';
            }
        });
    }

    // Call Buttons Logic
    const callButtons = document.querySelectorAll('.btn-call');
    
    callButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.hotline-card');
            const phoneNumberElement = card.querySelector('.phone-number');
            const phoneNumberText = phoneNumberElement.innerText.trim();
            
            alert(`Opening dialer for: ${phoneNumberText}`);
        });
    });
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
});
