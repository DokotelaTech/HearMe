const currentPage =
    window.location.pathname;

const navLinks =
    document.querySelectorAll(".nav-item");

navLinks.forEach(link => {

    const href =
        link.getAttribute("href");

    if(currentPage.includes(href)){

        link.classList.add("active");
    }
});