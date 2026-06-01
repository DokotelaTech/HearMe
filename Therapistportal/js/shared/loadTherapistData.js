// BASE API URL
const API_BASE = "/api";

// LOAD THERAPIST DATA
async function loadTherapistData() {
    try {
        const token = localStorage.getItem("token");

        if (!token) {
            window.location.href = "/login";
            alert("session expired!");
            return;
        }

        const response = await fetch(`${API_BASE}/therapist/profile`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch therapist");
        }

        const therapist = await response.json();
        updateNavbar(therapist);

    } catch (error) {
        console.log(error);
    }
}

// UPDATE UI
function updateNavbar(therapist) {
    // FULL NAME
    const firstName = therapist.firstName || "";
    const lastName = therapist.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim() || "Therapist";

    // INITIALS
    const initials = `${firstName[0] || "T"}${lastName[0] || ""}`.toUpperCase();

    // NAV NAME
    const navName = document.getElementById("nav-name") || document.getElementById("therapistName");
    if (navName) {
        navName.textContent = fullName;
    }

    // NAV ROLE
    const navRole = document.getElementById("nav-role") || document.getElementById("therapistRole");
    if (navRole) {
        navRole.textContent = therapist.qualification || therapist.role || "Therapist";
    }

    // AVATAR
    const avatarElements = document.querySelectorAll("#nav-avatar, #therapistInitials");
    avatarElements.forEach((avatar) => {
        if (therapist.profileImage) {
            avatar.textContent = "";
            avatar.style.backgroundImage = `url(${therapist.profileImage})`;
            avatar.style.backgroundSize = "cover";
            avatar.style.backgroundPosition = "center";
        } else {
            avatar.textContent = initials;
            avatar.style.backgroundImage = "";
        }
    });
}

// RUN
document.addEventListener("DOMContentLoaded", loadTherapistData);