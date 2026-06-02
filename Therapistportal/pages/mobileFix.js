document.addEventListener("DOMContentLoaded", () => {

    const menuBtn = document.getElementById("mobileMenuBtn");
    const sidebar = document.querySelector(".sidebar");

    if(menuBtn && sidebar){

        menuBtn.addEventListener("click", () => {
            sidebar.classList.toggle("active");
        });

        document.addEventListener("click", (e) => {

            if(
                !sidebar.contains(e.target) &&
                !menuBtn.contains(e.target)
            ){
                sidebar.classList.remove("active");
            }

        });

    }

});