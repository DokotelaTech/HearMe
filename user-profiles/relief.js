// Initialize Icons
lucide.createIcons();

document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.exercise-card');

    cards.forEach(card => {
        card.addEventListener('click', () => {
            const exercise = card.querySelector('h3').innerText;
            
            // Interaction feedback: Pulse the icon
            const icon = card.querySelector('.icon-circle');
            icon.style.transform = 'scale(1.2)';
            icon.style.transition = 'transform 0.3s ease';
            
            setTimeout(() => {
                icon.style.transform = 'scale(1)';
                alert(`Starting your ${exercise} session. Find a comfortable position.`);
            }, 300);
        });
    });
});