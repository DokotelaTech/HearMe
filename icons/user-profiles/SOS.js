lucide.createIcons();

// Toggle Join Button State
function toggleJoin(btn) {
    if (btn.innerText === "Join Group") {
        btn.innerText = "Joined";
        btn.style.background = "#e5e7eb";
        btn.style.color = "#4b5563";
    } else {
        btn.innerText = "Join Group";
        btn.style.background = "linear-gradient(90deg, #a820c7, #ff1b7e)";
        btn.style.color = "white";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');

    // Sidebar active state on scroll/click
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // SOS Logic
    const sos = document.getElementById('sosTrigger');
    sos.addEventListener('click', () => {
        const confirmSOS = confirm("Are you sure you want to activate SOS? This will alert emergency services.");
        if(confirmSOS) {
            sos.innerText = "ALERTTING...";
            sos.style.background = "red";
        }
    });
});