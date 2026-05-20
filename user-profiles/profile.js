// 1. Initialize Icons immediately
lucide.createIcons();

document.addEventListener('DOMContentLoaded', async () => {
    // --- AUTHENTICATION CHECK ---
    const token = localStorage.getItem('token');
    const currentUserIdentifier = localStorage.getItem('userIdentifier');

    if (!token) {
        alert("Please log in to view your profile.");
        window.location.href = 'login.html';
        return;
    }

    // --- FETCH & RENDER PROFILE DATA ---
    try {
        const response = await fetch('http://localhost:5000/api/user/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();

            // Update Name and Member Since Date
            const profileName = document.querySelector('.profile-name');
            const memberSince = document.querySelector('.member-since');
            const avatarLarge = document.querySelector('.profile-avatar-large');
            const postStatCount = document.getElementById('stat-posts-shared');

            if (profileName) profileName.innerText = data.identifier;
            if (memberSince) memberSince.innerText = `Member since ${new Date(data.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
            if (avatarLarge) avatarLarge.innerText = data.identifier.charAt(0).toUpperCase();
            
            // Update the "Posts Shared" box from your screenshot
            if (postStatCount) postStatCount.innerText = data.postCount;

        } else {
            console.error('Failed to load profile data');
        }
    } catch (err) {
        console.error("Profile load error:", err);
    }

    // --- ROADMAP INTERACTIVITY LOGIC ---
    const taskItems = document.querySelectorAll('.task-item');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    function updateProgress() {
        if (!taskItems.length) return;

        const totalTasks = taskItems.length;
        const completedTasks = document.querySelectorAll('.task-item.completed').length;
        
        const percentage = Math.round((completedTasks / totalTasks) * 100);
        
        if (progressBar) progressBar.style.width = `${percentage}%`;
        if (progressText) progressText.innerText = `${percentage}% Complete`;
    }

    taskItems.forEach(item => {
        item.addEventListener('click', () => {
            item.classList.toggle('completed');

            const checkContainer = item.querySelector('.task-check');
            if (item.classList.contains('completed')) {
                checkContainer.innerHTML = '<i data-lucide="check-circle-2"></i>';
            } else {
                checkContainer.innerHTML = '<div class="circle-outline"></div>';
            }
            
            // Refresh icons for the newly added checkmarks
            lucide.createIcons();
            updateProgress();
        });
    });

    // Initial progress calculation
    updateProgress();

    // --- LOGOUT LOGIC (Optional, but recommended here) ---
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'login.html';
        });
    }
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