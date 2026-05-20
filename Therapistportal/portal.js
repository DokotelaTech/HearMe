document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view-panel');

    // Tab Switching Logic
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // 1. Remove active state from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // 2. Add active state to clicked item
            item.classList.add('active');
            
            // 3. Get the target view ID
            const targetViewId = `view-${item.getAttribute('data-target')}`;
            
            // 4. Hide all views, show the target view
            views.forEach(view => {
                view.classList.remove('active');
                if (view.id === targetViewId) {
                    view.classList.add('active');
                }
            });
        });
    });

    // Sub-tab logic for "My Clients" filter
    const clientTabs = document.querySelectorAll('.tabs button');
    clientTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            clientTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    // Report Category Button toggle
    const catBtns = document.querySelectorAll('.cat-btn');
    catBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            catBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
});
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('profileToggle');
  const dropdown = document.getElementById('profileDropdown');

  // Toggle the dropdown when clicking the profile button
  toggleBtn.addEventListener('click', (e) => {
    e.preventDefault(); // Prevents the anchor tag from jumping the page
    dropdown.classList.toggle('show');
  });

  // Close the dropdown if the user clicks outside of it
  window.addEventListener('click', (e) => {
    if (!toggleBtn.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove('show');
    }
  });
});