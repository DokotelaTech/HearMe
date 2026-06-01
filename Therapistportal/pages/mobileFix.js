document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.getElementById("mobileMenuBtn");
    const sidebar = document.querySelector(".sidebar");

    if (menuBtn && sidebar) {
        // Toggle sidebar when clicking the hamburger menu button
        menuBtn.addEventListener("click", (e) => {
            e.stopPropagation(); // Prevents immediate close from the document listener below
            sidebar.classList.toggle("show");
        });

        // Close sidebar when clicking anywhere else on the screen
        document.addEventListener("click", (e) => {
            if (sidebar.classList.contains("show") && !sidebar.contains(e.target) && e.target !== menuBtn) {
                sidebar.classList.remove("show");
            }
        });
    }
});