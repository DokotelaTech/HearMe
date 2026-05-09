// Initialize Icons
lucide.createIcons();

document.addEventListener('DOMContentLoaded', () => {
    // 1. Handle Category Filters
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // 2. Handle Join Group Logic
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

    // 3. Handle View Chat Redirection (Event Delegation)
    // This watches for any click on the document and checks if it was a ".view-chat-btn"
    document.addEventListener('click', (e) => {
        // Find if the click (or the icon clicked) is inside a .view-chat-btn
        const btn = e.target.closest('.view-chat-btn');
        
        if (btn) {
            // Find the parent card to get the group name (e.g., "Anxiety Warriors")
            const groupCard = btn.closest('.group-card');
            if (groupCard) {
                const groupName = groupCard.querySelector('h3').innerText;
                
                // Save the group name so the chat page knows which room to join
                localStorage.setItem('activeGroup', groupName);
                
                // Redirect to the chat page
                window.location.href = 'group-chat.html';
            }
        }
    });
});