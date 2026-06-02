document.addEventListener("DOMContentLoaded", () => {

    const menuBtn = document.getElementById("mobileMenuBtn");
    const sidebar = document.querySelector(".sidebar");

    if(menuBtn && sidebar){

    if (topbar && sidebar) {

        if (!menuBtn) {
            // CASE C / D: No button at all — create one using safe FontAwesome class
            menuBtn = document.createElement("button");
            menuBtn.id        = "mobileMenuBtn";
            menuBtn.className = "mobile-menu-btn";
            menuBtn.setAttribute("aria-label", "Open menu");
            menuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
            topbar.insertBefore(menuBtn, topbar.firstChild);

        } else if (!topbar.contains(menuBtn)) {
            // CASE B: Button is inside sidebar/brand-area — move clone to topbar
            const clone = menuBtn.cloneNode(true);
            clone.id    = "mobileMenuBtn";
            
            // Ensure original button doesn't conflict
            menuBtn.id  = "mobileMenuBtnHidden";
            menuBtn.style.display = "none";
            
            topbar.insertBefore(clone, topbar.firstChild);
            menuBtn = clone;

            // CRITICAL FIX: If lucide script is available globally, force it to parse 
            // the freshly inserted clone inside the topbar instantly.
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
        // CASE A: Already in topbar — nothing to do
    }

    // ================================
    // 2. OVERLAY
    // ================================

    let overlay = document.querySelector(".sidebar-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.className = "sidebar-overlay";
        document.body.appendChild(overlay);
    }

    // ================================
    // 3. OPEN / CLOSE
    // ================================

    function openSidebar() {
        if (!sidebar) return;
        sidebar.classList.add("open", "show");
        overlay.classList.add("active", "visible");
        document.body.style.overflow = "hidden"; // prevent background scroll
    }

    function closeSidebar() {
        if (!sidebar) return;
        sidebar.classList.remove("open", "show");
        overlay.classList.remove("active", "visible");
        document.body.style.overflow = "";
    }
    
    // ================================
    // 4. EVENTS
    // ================================

    // Use Event Delegation: Listen to the entire document body for the click
    document.body.addEventListener("click", (e) => {
        // Find if the clicked element (or its icon nested inside) is your mobile menu button
        const targetButton = e.target.closest("#mobileMenuBtn");
        
        if (targetButton && sidebar) {
            e.stopPropagation();
            const isOpen = sidebar.classList.contains("open") || sidebar.classList.contains("show");
            isOpen ? closeSidebar() : openSidebar();
        }
    });

    // Keep your standard overlay and close conditions below intact
    if (sidebar && overlay) {
        overlay.addEventListener("click", closeSidebar);

        sidebar.querySelectorAll(".nav-item").forEach((link) => {
            link.addEventListener("click", closeSidebar);
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
}});