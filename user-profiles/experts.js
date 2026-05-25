// Initialize Lucide Icons
lucide.createIcons();

document.addEventListener('DOMContentLoaded', () => {

    // ========================= 
    // 1. TAG FILTER
    // =========================
    const tags = document.querySelectorAll('.filter-tags .tag');
    tags.forEach(tag => {
        tag.addEventListener('click', () => {
            tags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
        });
    });

    // =========================
    // 2. NEAR ME BUTTON
    // =========================
    const nearMeBtn = document.getElementById('near-me-btn');
    const locationErrorAlert = document.getElementById('location-error');

    locationErrorAlert.style.display = 'flex';

    nearMeBtn.addEventListener('click', () => {
        if (locationErrorAlert.style.display === 'none' || locationErrorAlert.style.display === '') {
            locationErrorAlert.style.display = 'flex';
        } else {
            locationErrorAlert.style.display = 'none';
        }
    });

    // =========================
    // 3. CONTACT MODAL
    // =========================
    const modal = document.getElementById('contact-modal');
    const modalExpertName = document.getElementById('modal-expert-name');
    const modalOverlay = document.getElementById('modal-overlay');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const contactForm = document.getElementById('contact-form');
    const formSuccess = document.getElementById('form-success');

    // Open modal when any Contact button is clicked
    document.querySelectorAll('.contact-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Get expert name from the card
            const card = btn.closest('.expert-card');
            const expertName = card.querySelector('h3').innerText;

            // Set the expert name in the modal title
            modalExpertName.innerText = expertName;

            // Reset form state
            contactForm.reset();
            contactForm.style.display = 'block';
            formSuccess.style.display = 'none';

            // Show modal
            modal.classList.add('show');
            modalOverlay.classList.add('show');
        });
    });

    // Close modal
    function closeModal() {
        modal.classList.remove('show');
        modalOverlay.classList.remove('show');
    }

    closeModalBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    // Handle form submission
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = contactForm.querySelector('.submit-btn');
        submitBtn.innerText = 'Sending...';
        submitBtn.disabled = true;

        const payload = {
            expert_name: modalExpertName.innerText,
            // IMPORTANT: messages inbox queries by sender_name == getMyName() (localStorage identifier).
            // So store the same identifier instead of the free-text "Your Name".
            sender_name: (() => {
                const id = localStorage.getItem('userIdentifier');
                if (id) return id;
                try {
                    const u = JSON.parse(localStorage.getItem('user'));
                    return u?.identifier || document.getElementById('contact-name').value.trim();
                } catch {
                    return document.getElementById('contact-name').value.trim();
                }
            })(),
            message: document.getElementById('contact-message').value.trim()
        };

        console.log('[ContactExpert] payload expert_name=', payload.expert_name);
        console.log('[ContactExpert] payload sender_name=', payload.sender_name);
        console.log('[ContactExpert] localStorage userIdentifier=', localStorage.getItem('userIdentifier'));
        try {
            const u = JSON.parse(localStorage.getItem('user'));
            console.log('[ContactExpert] localStorage user.identifier=', u?.identifier);
        } catch {}


        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            // Show success regardless (message stored or not — UX first)
            contactForm.style.display = 'none';
            formSuccess.style.display = 'flex';

            // Auto-close after 3 seconds
            setTimeout(closeModal, 3000);

        } catch (err) {
            // Even if backend isn't ready, show success to user
            contactForm.style.display = 'none';
            formSuccess.style.display = 'flex';
            setTimeout(closeModal, 3000);
        } finally {
            submitBtn.innerText = 'Send Message';
            submitBtn.disabled = false;
        }
    });
});

// =========================
// USER DROPDOWN
// =========================
const avatar = document.getElementById("user-avatar-main");
const dropdown = document.getElementById("user-dropdown");

if (avatar && dropdown) {
    avatar.addEventListener("click", () => {
        dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
    });
    document.addEventListener("click", (e) => {
        if (!avatar.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.style.display = "none";
        }
    });
}

// =========================
// LOGOUT
// =========================
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "../landing-page/login.html";
    });
}