// CHECK TOKEN
const token =
    localStorage.getItem("token");

// IF NO TOKEN

if(!token){

    window.location.href = "/login";
    alert("could not perfom this function please login")
}