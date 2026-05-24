 profileToggle =
document.getElementById(
    "profileToggle"
);

 profileDropdown =
document.getElementById(
    "profileDropdown"
);

 dropdownIcon =
document.getElementById(
    "dropdownIcon"
);

// TOGGLE DROPDOWN
<<<<<<< HEAD
=======

>>>>>>> 98ea0a3 (sprint 2)
profileToggle?.addEventListener(
    "click",
    (event) => {

        event.preventDefault();

        event.stopPropagation();

        profileDropdown.classList.toggle(
            "show-dropdown"
        );

        dropdownIcon?.classList.toggle(
            "rotate-arrow"
        );
    }
);

// CLOSE WHEN CLICKING OUTSIDE

window.addEventListener(
    "click",
    (event) => {

        if(
            !event.target.closest(
                ".profile-container"
            )
        ){

            profileDropdown.classList.remove(
                "show-dropdown"
            );

            dropdownIcon?.classList.remove(
                "rotate-arrow"
            );
        }
    }
);

// LOGOUT
<<<<<<< HEAD
=======

>>>>>>> 98ea0a3 (sprint 2)
document.getElementById(
    "logoutBtn"
)?.addEventListener(
    "click",
    () => {

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "user"
        );

        window.location.href =
<<<<<<< HEAD
        "/login";
=======
        "../../landing-page/login.html";
>>>>>>> 98ea0a3 (sprint 2)
    }
);