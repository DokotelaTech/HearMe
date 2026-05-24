const API_BASE =
"http://localhost:5000/api";

// LOAD THERAPIST DATA

async function loadTherapistData(){

    try{

        const token =
        localStorage.getItem("token");

        if(!token){

            window.location.href =
<<<<<<< HEAD
            "/login";

            alert("session expired!")
=======
            "/old interfaces/login.html";

>>>>>>> 98ea0a3 (sprint 2)
            return;
        }

        const response =
        await fetch(
            `${API_BASE}/therapist/profile`,
            {
                method:"GET",

                headers:{
                    Authorization:
                    `Bearer ${token}`
                }
            }
        );

        if(!response.ok){

            throw new Error(
                "Failed to fetch therapist"
            );
        }

        const therapist =
        await response.json();

        updateNavbar(therapist);

    }catch(error){

        console.log(error);
    }
}

// UPDATE UI

function updateNavbar(therapist){

    // FULL NAME

    const fullName =
    `${therapist.firstName} ${therapist.lastName}`;

    // INITIALS

    const initials =
    `${therapist.firstName[0]}${
        therapist.lastName[0]
    }`;

    // NAV NAME

    const navName =
    document.getElementById("nav-name");

    if(navName){

        navName.textContent =
        fullName;
    }

    // NAV ROLE

    const navRole =
    document.getElementById("nav-role");

    if(navRole){

        navRole.textContent =
        therapist.role || "Therapist";
    }

    // AVATAR

    const navAvatar =
    document.getElementById("nav-avatar");

    if(navAvatar){

        navAvatar.textContent =
        initials;
    }
}

// RUN

document.addEventListener(
    "DOMContentLoaded",
    loadTherapistData
);