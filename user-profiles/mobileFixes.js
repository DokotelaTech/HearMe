// mobileFixes.js

document.addEventListener("DOMContentLoaded", () => {

    // =========================
    // MOBILE MENU TOGGLE
    // Supports both .show and .open class names
    // =========================

    const menuBtn = document.getElementById("mobileMenuBtn");
    const sidebar = document.querySelector(".sidebar");

    if (menuBtn && sidebar) {

        menuBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            sidebar.classList.toggle("show");
            sidebar.classList.toggle("open");
        });

        // Close sidebar when clicking anywhere outside it
        document.addEventListener("click", (e) => {
            if (
                sidebar.classList.contains("show") ||
                sidebar.classList.contains("open")
            ) {
                if (!sidebar.contains(e.target) && e.target !== menuBtn) {
                    sidebar.classList.remove("show");
                    sidebar.classList.remove("open");
                }
            }
        });

        // Close sidebar when a nav link is tapped (mobile nav)
        sidebar.querySelectorAll(".nav-item").forEach((link) => {
            link.addEventListener("click", () => {
                sidebar.classList.remove("show");
                sidebar.classList.remove("open");
            });
        });
    }

    // =========================
    // ACTIVE NAV ITEM
    // Matches current page URL to sidebar links
    // =========================

    const navItems = document.querySelectorAll(".sidebar .nav-item");

    if (navItems.length > 0) {

        const currentPath = window.location.pathname
            .toLowerCase()
            .replace(/\/$/, ""); // remove trailing slash

        let bestMatch = null;
        let bestMatchLength = 0;

        navItems.forEach((item) => {
            // Remove any existing active class first
            item.classList.remove("active");

            const href = item.getAttribute("href");
            if (!href) return;

            const linkPath = href
                .toLowerCase()
                .replace(/\/$/, "");

            // Find the longest matching path segment
            if (
                currentPath === linkPath ||
                currentPath.startsWith(linkPath + "/") ||
                currentPath.endsWith(linkPath)
            ) {
                if (linkPath.length > bestMatchLength) {
                    bestMatch = item;
                    bestMatchLength = linkPath.length;
                }
            }
        });

        // Also check by filename for pages not under /user/ routes
        if (!bestMatch) {
            const pageName = currentPath.split("/").pop(); // e.g. "messages"

            navItems.forEach((item) => {
                const href = (item.getAttribute("href") || "").toLowerCase();
                if (href.includes(pageName) && pageName.length > 0) {
                    if (href.length > bestMatchLength) {
                        bestMatch = item;
                        bestMatchLength = href.length;
                    }
                }
            });
        }

        if (bestMatch) {
            bestMatch.classList.add("active");
        }
    }

});