// Adding simple interactivity to the SOS and Call buttons
document.addEventListener('DOMContentLoaded', () => {
    
    // SOS Button Logic
    const sosButton = document.getElementById('sosButton');
    
    if (sosButton) {
        sosButton.addEventListener('click', () => {
            // In a real application, this would trigger an emergency protocol API
            alert('SOS Activated! Initiating emergency protocols and fetching location...');
            
            // Visual feedback
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
            // Find the associated phone number in the same card
            const card = e.target.closest('.hotline-card');
            const phoneNumberElement = card.querySelector('.phone-number');
            const phoneNumberText = phoneNumberElement.innerText.trim();
            
            alert(`Opening dialer for: ${phoneNumberText}`);
        });
    });
});