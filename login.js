document.addEventListener("DOMContentLoaded", function () {

    document.getElementById("Btn").addEventListener("click", function (e) {

        e.preventDefault();

        let userGmail = document.getElementById("email").value.trim();
        let userPassword = document.getElementById("password").value.trim();

        if (userGmail === "" || userPassword === "") {
            alert("All fields are required");
            return;
        }

        window.location.href = "feeds.html";

    });

});