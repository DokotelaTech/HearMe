const form = document.querySelector("#register-form form");

form.addEventListener("submit", function(e){

const username =
form.username.value.trim();

const email =
form.email.value.trim();

const password =
form.password.value.trim();

if(username === "" ||
email === "" ||
password === ""){
   e.preventDefault();
   alert("Please fill in all fields");
   return;
}

if(!email.includes("@") ||
!email.includes(".")){
   e.preventDefault();
   alert("Enter valid email");
   return;
}

if(password.length < 6){
   e.preventDefault();
   alert(
    "Password must be at least 6 characters"
   );
   return;
}

/* If valid:
allow normal form submit to PHP */
});