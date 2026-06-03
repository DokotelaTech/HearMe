// ============================================================
//  sos.js  (your existing frontend file — updated SOS section)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

    // ── SOS Button ───────────────────────────────────────────
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
            sosButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ACTIVATED...';
            sosButton.style.opacity = '0.8';

            try {
                const response = await fetch('/api/emergency/sos', {   // ← updated endpoint
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type':  'application/json'
                    },
                    // no body needed — server reads the user from the JWT
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

    // ── Call Buttons (unchanged) ─────────────────────────────
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

// ── Page Transition System (unchanged) ───────────────────────
document.addEventListener("DOMContentLoaded", () => {
    document.body.style.opacity = "1";
});

document.querySelectorAll("a.nav-item").forEach(link => {
    link.addEventListener("click", function (e) {
        const href = this.getAttribute("href");
        if (href && !href.startsWith("#")) {
            e.preventDefault();
            document.body.classList.add("fade-out");
            setTimeout(() => { window.location.href = href; }, 300);
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const trigger = document.getElementById('dropdownTrigger');
    const menu    = document.getElementById('dropdownMenu');

    if (trigger && menu) {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('show');
        });
        document.addEventListener('click', (e) => {
            if (!trigger.contains(e.target) && !menu.contains(e.target)) {
                menu.classList.remove('show');
            }
        });
    }
});