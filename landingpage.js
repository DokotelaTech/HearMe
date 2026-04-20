(function(){
// adds a small interactive feedback on pillar click (optional, like a micro interaction)
const pillars = document.querySelectorAll('.pillar');
pillars.forEach(p => {
    p.addEventListener('click', function(e) {
        // just a soft ripple effect for demonstration (no navigation)
        this.style.transition = 'all 0.15s';
        this.style.backgroundColor = '#f5f9ff';
        setTimeout(() => { this.style.backgroundColor = ''; }, 120);
        // (could be used to open modals, but we keep it clean)
    });
});

// Also prob-card click highlight (satisfying)
const probCards = document.querySelectorAll('.prob-card');
probCards.forEach(card => {
    card.addEventListener('click', () => {
        card.style.transition = 'background 0.15s';
        card.style.backgroundColor = '#fbfdff';
        setTimeout(() => card.style.backgroundColor = '', 100);
    });
});
})();