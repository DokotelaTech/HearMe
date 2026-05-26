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