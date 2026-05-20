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