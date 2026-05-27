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
        "/login";
    }
);