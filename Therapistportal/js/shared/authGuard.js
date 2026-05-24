// CHECK TOKEN

const token =
    localStorage.getItem("token");

// IF NO TOKEN

if(!token){

    window.location.href =
        "/old interfaces/login.html";
}