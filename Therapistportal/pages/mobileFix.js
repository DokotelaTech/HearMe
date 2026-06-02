obilefixes · JS
// mobileFixes.js — works on BOTH user pages and therapist pages
 
document.addEventListener("DOMContentLoaded", () => {
 
    // ================================
    // 1. MOBILE MENU TOGGLE
    //    Supports .open and .show class names
    //    Works whether menu btn is in topbar OR brand-area
    // ================================
 
    const menuBtn = document.getElementById("mobileMenuBtn");
    const sidebar = document.querySelector(".sidebar");
 
    // Create overlay if it doesn't already exist in the HTML
    let overlay = document.querySelector(".sidebar-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.className = "sidebar-overlay";
        document.body.appendChild(overlay);
    }
 
    function openSidebar() {
        sidebar.classList.add("open", "show");
        overlay.classList.add("active", "visible");
    }
 
    function closeSidebar() {
        sidebar.classList.remove("open", "show");
        overlay.classList.remove("active", "visible");
    }
 
    if (menuBtn && sidebar) {
 
        menuBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const isOpen = sidebar.classList.contains("open") ||
                           sidebar.classList.contains("show");
            isOpen ? closeSidebar() : openSidebar();
        });
 
        // Close when clicking the overlay
        overlay.addEventListener("click", closeSidebar);
 
        // Close when a nav link is tapped
        sidebar.querySelectorAll(".nav-item").forEach((link) => {
            link.addEventListener("click", closeSidebar);
        });
 
        // Close on Escape key
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") closeSidebar();
        });
    }
 
    // ================================
    // 2. ACTIVE NAV ITEM
    //    Auto-sets .active based on current URL
    //    Clears any hardcoded active classes first
    // ================================
 
    const navItems = document.querySelectorAll(".sidebar .nav-item, .nav-menu .nav-item");
 
    if (navItems.length > 0) {
 
        const currentPath = window.location.pathname
            .toLowerCase()
            .replace(/\/$/, "");
 
        let bestMatch = null;
        let bestMatchLength = 0;
 
        navItems.forEach((item) => {
            item.classList.remove("active");
 
            const href = (item.getAttribute("href") || "").toLowerCase().replace(/\/$/, "");
            if (!href || href === "#") return;
 
            if (
                currentPath === href ||
                currentPath.startsWith(href + "/") ||
                currentPath.endsWith(href)
            ) {
                if (href.length > bestMatchLength) {
                    bestMatch = item;
                    bestMatchLength = href.length;
                }
            }
        });
 
        // Fallback: match by last path segment (filename)
        if (!bestMatch) {
            const pageName = currentPath.split("/").pop();
 
            if (pageName) {
                navItems.forEach((item) => {
                    const href = (item.getAttribute("href") || "").toLowerCase();
                    if (href.includes(pageName) && href.length > bestMatchLength) {
                        bestMatch = item;
                        bestMatchLength = href.length;
                    }
                });
            }
        }
 
        if (bestMatch) {
            bestMatch.classList.add("active");
        }
    }
 
});