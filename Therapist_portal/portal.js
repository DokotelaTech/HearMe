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