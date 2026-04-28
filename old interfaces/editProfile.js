// Preview selected image
let imageInput = document.getElementById("imageInput");
let preview = document.getElementById("preview");

imageInput.onchange = function () {
    let file = imageInput.files[0];
    if (file) {
        preview.src = URL.createObjectURL(file);
    }
};

// Save profile
function saveProfile() {
    let username = document.getElementById("username").value;
    let bio = document.getElementById("bio").value;
    let email = document.getElementById("email").value;

    if (username === "" || email === "") {
        alert("Please fill in required fields");
        return;
    }

    alert("Profile saved");
}

// Go back
function goBack() {
    window.location.href = "profile.html";
}