
document.addEventListener("DOMContentLoaded", () => {

    const menuBtn = document.getElementById("mobileMenuBtn");
    const sidebar = document.querySelector(".sidebar");

    if(menuBtn && sidebar){

        menuBtn.addEventListener("click", () => {

            sidebar.classList.toggle("show");

        });

    }

});