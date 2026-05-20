// Initialize Lucide Icons
lucide.createIcons();

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Tag Filter Interactivity
    const tags = document.querySelectorAll('.filter-tags .tag');
    
    tags.forEach(tag => {
        tag.addEventListener('click', () => {
            // Remove active class from all tags
            tags.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tag
            tag.classList.add('active');
        });
    });

    // 2. "Near Me" Location Error Toggle
    const nearMeBtn = document.getElementById('near-me-btn');
    const locationErrorAlert = document.getElementById('location-error');

    // On page load, show the alert to match the screenshot
    locationErrorAlert.style.display = 'flex'; 

    nearMeBtn.addEventListener('click', () => {
        // Toggle the visibility of the location error banner for demonstration
        if (locationErrorAlert.style.display === 'none' || locationErrorAlert.style.display === '') {
            locationErrorAlert.style.display = 'flex';
        } else {
            locationErrorAlert.style.display = 'none';
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

        if (dropdown.style.display === "block") {
            dropdown.style.display = "none";
        } else {
            dropdown.style.display = "block";
        }

    });

    document.addEventListener("click", (e) => {

        if (
            !avatar.contains(e.target) &&
            !dropdown.contains(e.target)
        ) {
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