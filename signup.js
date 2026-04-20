const form = document.querySelector("#register-form form");

form.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value.trim();

    // Check if fields are empty
    if (name === "" || email === "" || password === "") {
        alert("Please fill in all fields.");
        return;
    }

    // Simple email format check
    if (!email.includes("@") || !email.includes(".")) {
        alert("Please enter a valid email.");
        return;
    }

    // Password validation
    if (password.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
    }

    // If everything is valid
    alert("Registration successful!");

    // Redirect to login page
    window.location.href = "login.html";
});