// Initialize Icons
lucide.createIcons();

document.addEventListener('DOMContentLoaded', () => {
    // Handle Category Filters
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Handle Join Group Logic
    const joinBtns = document.querySelectorAll('.join-group-btn');
    joinBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Transform button to "Joined" state
            const actionsDiv = this.parentElement;
            
            // Create the new layout for joined state
            actionsDiv.innerHTML = `
                <button class="joined-status">Joined</button>
                <button class="view-chat-btn"><i data-lucide="message-circle"></i> View Chat</button>
            `;
            
            // Re-render icons for the new buttons
            lucide.createIcons();
            
            // Small alert for user feedback
            console.log("Joined new group!");
        });
    });
});