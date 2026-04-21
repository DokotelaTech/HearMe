let elements = document.querySelectorAll(".hidden");

window.addEventListener("scroll", function () {
    let triggerBottom = window.innerHeight * 0.85;

    elements.forEach(function (el) {
        let boxTop = el.getBoundingClientRect().top;

        if (boxTop < triggerBottom) {
            el.classList.add("show");
        }
    });
});

/// for the support section

// Scroll reveal
window.addEventListener("scroll", function () {
    let cards = document.querySelectorAll(".card-ai");

    cards.forEach(card => {
        let position = card.getBoundingClientRect().top;
        let screenHeight = window.innerHeight;

        if (position < screenHeight - 100) {
            card.classList.add("show");
        }
    });
});