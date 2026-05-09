// --- 1. DATA INITIALIZATION ---

// Achievements remain independent of the roadmap
const achievementsData = [
    { title: "First Step", desc: "Joined the HearMe community", icon: "🌟" },
    { title: "Opened Up", desc: "Shared your first reflection", icon: "💭" },
    { title: "Community Member", desc: "Joined a support group", icon: "🤝" }
];

/**
 * Loads events from localStorage or sets defaults if empty.
 * This ensures events remain saved even after logging off.
 */
function getStoredEvents() {
    const savedEvents = localStorage.getItem('hearme_events');
    if (savedEvents) {
        return JSON.parse(savedEvents);
    } else {
        const defaultEvents = [
            { name: "Anxiety Warriors Group Session", time: "Today at 7:00 PM", icon: "users" },
            { name: "Mindfulness Workshop", time: "May 5 at 6:00 PM", icon: "wind" },
            { name: "1-on-1 Session with Dr. Sarah", time: "May 8 at 3:00 PM", icon: "calendar" }
        ];
        // Save the defaults to storage immediately
        localStorage.setItem('hearme_events', JSON.stringify(defaultEvents));
        return defaultEvents;
    }
}

// --- 2. CORE SYSTEM FUNCTIONS ---

/**
 * Logic to calculate and update Days Active
 * This uses localStorage to track unique calendar days.
 */
function updateDaysActive() {
    const daysStat = document.getElementById('stat-days');
    const today = new Date().toDateString(); // e.g., "Sat May 02 2026"
    
    let lastLogin = localStorage.getItem('hearme_last_login');
    let activeCount = parseInt(localStorage.getItem('hearme_active_days')) || 0;

    if (!lastLogin) {
        activeCount = 1;
        localStorage.setItem('hearme_active_days', activeCount);
        localStorage.setItem('hearme_last_login', today);
    } 
    else if (lastLogin !== today) {
        activeCount += 1;
        localStorage.setItem('hearme_active_days', activeCount);
        localStorage.setItem('hearme_last_login', today);
    }

    if (daysStat) {
        daysStat.innerText = activeCount;
    }
}

function renderIndependentContent() {
    const eventContainer = document.getElementById('dynamic-events');
    const achContainer = document.getElementById('dynamic-achievements');

    // Fetch Events from persistent storage instead of a hardcoded array
    const events = getStoredEvents();

    if (eventContainer) {
        eventContainer.innerHTML = events.map(e => `
            <div class="event-box">
                <i data-lucide="${e.icon}" class="purple-icon"></i>
                <div>
                    <h4 style="margin:0; font-size:13px;">${e.name}</h4>
                    <p style="margin:0; font-size:11px; color:#64748b;">${e.time}</p>
                </div>
            </div>
        `).join('');
    }

    if (achContainer) {
        achContainer.innerHTML = achievementsData.map(a => `
            <div class="ach-box">
                <span style="font-size:18px;">${a.icon}</span>
                <div>
                    <h4 style="margin:0; font-size:13px;">${a.title}</h4>
                    <p style="margin:0; font-size:11px; color:#92400e;">${a.desc}</p>
                </div>
            </div>
        `).join('');
    }

    lucide.createIcons();
}

// --- 3. EVENT LISTENERS ---

document.addEventListener('DOMContentLoaded', () => {
    const tasks = document.querySelectorAll('.task-item');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const sessionStat = document.getElementById('stat-sessions');

    // Run persistent system checks on load
    updateDaysActive();
    renderIndependentContent();

    tasks.forEach(task => {
        task.addEventListener('click', () => {
            const isDone = task.classList.toggle('completed');
            const check = task.querySelector('.task-check');
            
            check.innerHTML = isDone 
                ? '<i data-lucide="check-circle-2" color="#15803d"></i>' 
                : '<div class="circle-outline"></div>';

            const doneCount = document.querySelectorAll('.task-item.completed').length;
            const pct = Math.round((doneCount / tasks.length) * 100);

            if (progressBar) progressBar.style.width = `${pct}%`;
            if (progressText) progressText.innerText = `${pct}% Complete`;
            if (sessionStat) sessionStat.innerText = doneCount; 
            
            lucide.createIcons();
        });
    });
});