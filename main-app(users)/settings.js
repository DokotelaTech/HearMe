// Load saved settings
window.onload = function () {
    document.getElementById("anonymousToggle").checked = getSetting("anonymous");
    document.getElementById("messageToggle").checked = getSetting("messages");
    document.getElementById("commentToggle").checked = getSetting("comments");
    document.getElementById("inboxToggle").checked = getSetting("inbox");
    document.getElementById("aiToggle").checked = getSetting("ai");
    document.getElementById("themeToggle").checked = getSetting("darkmode");
};

// Save setting
function saveSetting(key, value) {
    localStorage.setItem(key, value);
}

// Get setting
function getSetting(key) {
    return localStorage.getItem(key) === "true";
}

// Event listeners
document.getElementById("anonymousToggle").onchange = function () {
    saveSetting("anonymous", this.checked);
};

document.getElementById("messageToggle").onchange = function () {
    saveSetting("messages", this.checked);
};

document.getElementById("commentToggle").onchange = function () {
    saveSetting("comments", this.checked);
};

document.getElementById("inboxToggle").onchange = function () {
    saveSetting("inbox", this.checked);
};

document.getElementById("aiToggle").onchange = function () {
    saveSetting("ai", this.checked);
};

document.getElementById("themeToggle").onchange = function () {
    saveSetting("darkmode", this.checked);

    if (this.checked) {
        document.body.style.background = "#111";
    } else {
        document.body.style.background = "#0b1220";
    }
};

// Buttons
function resetAI() {
    alert("AI Chat history cleared");
}

function logout() {
    alert("Logged out!");
    window.location.href = "login.html";
}

function goToEdit() {
    window.location.href = "editProfile.html";
}

function changePassword() {
    alert("Password change feature coming soon");
}