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