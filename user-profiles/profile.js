// --- 1. DATA INITIALIZATION & SCREENSHOT SYNCHRONIZATION ---

// Healing Roadmap Items matching image screenshot explicitly
const roadmapTasks = [
    {
        id: 1,
        title: "Practice daily gratitude",
        desc: "Write down 3 things you're grateful for each morning",
        tag: "Daily Practice",
        completed: true
    },
    {
        id: 2,
        title: "Join a support group",
        desc: "Connect with others who share similar experiences",
        tag: "Community",
        completed: true
    },
    {
        id: 3,
        title: "Try breathing exercises",
        desc: "Practice the 4-4-4 breathing technique when feeling anxious",
        tag: "Stress Management",
        completed: false
    },
    {
        id: 4,
        title: "Schedule a session",
        desc: "Book your first session with a verified social worker",
        tag: "Professional Support",
        completed: false
    },
    {
        id: 5,
        title: "Share your success",
        desc: "Post a success story to inspire others in the community",
        tag: "Give Back",
        completed: false
    }
];

// Achievements data block populating matching items
const achievementsData = [
    {
        icon: "☀️",
        title: "First Step",
        desc: "Joined HearMe"
    },
    {
        icon: "💬",
        title: "Opened Up",
        desc: "Shared your first post"
    }
];

/**
 * Loads events matching screenshot items safely into memory
 */
function getStoredEvents() {
    const savedEvents = localStorage.getItem('hearme_events');
    if (savedEvents) {
        return JSON.parse(savedEvents);
    } else {
        const defaultEvents = [
            {
                icon: "calendar",
                // name: "Anxiety Warriors Group Session",
                // time: "Today at 7:00 PM",
                // tag: "Group"
            },
            {
                icon: "calendar",
                // name: "Mindfulness Workshop",
                // time: "Apr 26 at 6:00 PM",
                // tag: "Workshop"
            },
            {
                icon: "calendar",
                // name: "1-on-1 Session with Dr. Sarah Johnson",
                // time: "Apr 28 at 3:00 PM",
                // tag: "Session"
            }
        ];
        localStorage.setItem('hearme_events', JSON.stringify(defaultEvents));
        return defaultEvents;
    }
}

// --- 2. CORE RENDERING ENGINE FUNCTIONS ---

/**
 * Renders the Roadmap list container dynamically from object state tracking array
 */
function renderRoadmap() {
    const taskContainer = document.getElementById('roadmap-task-list');
    if (!taskContainer) return;

    taskContainer.innerHTML = roadmapTasks.map(task => {
        const itemClass = task.completed ? 'task-item completed' : 'task-item';
        const iconMarkup = task.completed 
            ? '<i data-lucide="check-circle-2" class="success-check" style="color: #15803d;"></i>' 
            : '<div class="circle-outline"></div>';
        
        return `
            <div class="${itemClass}" data-id="${task.id}">
                <div class="task-left">
                    <div class="task-check">${iconMarkup}</div>
                    <div class="task-text">
                        <h4>${task.title}</h4>
                        <p>${task.desc}</p>
                    </div>
                </div>
                <span class="task-tag tag-${task.tag.toLowerCase().replace(/\s+/g, '-')}">${task.tag}</span>
            </div>
        `;
    }).join('');

    calculateProgress();
    lucide.createIcons();
    attachRoadmapEventListeners();
}

/**
 * Calculates current roadmap validation percentage
 */
function calculateProgress() {
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    
    const total = roadmapTasks.length;
    const completedCount = roadmapTasks.filter(t => t.completed).length;
    const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

    if (progressBar) progressBar.style.width = `${pct}%`;
    if (progressText) progressText.innerText = `${pct}% Complete`;
}

/**
 * Renders Right Hand Widget Modules (Events and Achievements lists)
 */
function renderIndependentContent() {
    const eventContainer = document.getElementById('dynamic-events');
    const achContainer = document.getElementById('dynamic-achievements');
    const events = getStoredEvents();

    if (eventContainer) {
        eventContainer.innerHTML = events.map(e => `
            <div class="event-box">
                <div class="event-icon-container">
                    <i data-lucide="${e.icon}" class="purple-icon"></i>
                </div>
                <div class="event-details-box">
                    <h4>${e.name}</h4>
                    <p class="event-time">${e.time}</p>
                    <span class="event-badge badge-${e.tag.toLowerCase()}">${e.tag}</span>
                </div>
            </div>
        `).join('');
    }

    if (achContainer) {
        achContainer.innerHTML = achievementsData.map(a => `
            <div class="ach-box">
                <div class="ach-icon">${a.icon}</div>
                <div>
                    <h4>${a.title}</h4>
                    <p>${a.desc}</p>
                </div>
            </div>
        `).join('');
    }

    lucide.createIcons();
}

/**
 * Tracking logic for unique calendar entry days active count
 */
function updateDaysActive() {
    const daysStat = document.getElementById('stat-days');
    if (!daysStat) return;
    
    const today = new Date().toDateString();
    let lastLogin = localStorage.getItem('hearme_last_login');
    let activeCount = parseInt(localStorage.getItem('hearme_active_days')) || 45; // Default match to screenshot reference

    if (!lastLogin) {
        localStorage.setItem('hearme_active_days', activeCount);
        localStorage.setItem('hearme_last_login', today);
    } else if (lastLogin !== today) {
        activeCount += 1;
        localStorage.setItem('hearme_active_days', activeCount);
        localStorage.setItem('hearme_last_login', today);
    }

    daysStat.innerText = activeCount;
}

// --- 3. INTERACTIVE ACTIONS & HANDLERS ---

function attachRoadmapEventListeners() {
    document.querySelectorAll('.task-item').forEach(item => {
        item.onclick = function() {
            const taskId = parseInt(this.getAttribute('data-id'));
            const taskObj = roadmapTasks.find(t => t.id === taskId);
            
            if (taskObj) {
                // Toggle complete boolean state
                taskObj.completed = !taskObj.completed;
                
                // Re-render window layout elements seamlessly
                renderRoadmap();
            }
        };
    });
}

// Document Load Bootstrapper
document.addEventListener('DOMContentLoaded', () => {
    updateDaysActive();
    renderRoadmap();
    renderIndependentContent();
});

// =========================
// PAGE TRANSITION SYSTEM
// =========================

// Fade IN when page loads
document.addEventListener("DOMContentLoaded", () => {
    document.body.style.opacity = "1";
});

// Handle navigation clicks
document.querySelectorAll("a.nav-item").forEach(link => {
    link.addEventListener("click", function (e) {

        const href = this.getAttribute("href");

        // Only apply to internal links
        if (href && !href.startsWith("#")) {
            e.preventDefault();

            // fade out current page
            document.body.classList.add("fade-out");

            // wait for animation then go
            setTimeout(() => {
                window.location.href = href;
            }, 300); // must match CSS duration
        }
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const trigger = document.getElementById('dropdownTrigger');
    const menu = document.getElementById('dropdownMenu');

    if (trigger && menu) {
        // Toggle menu view when clicking the profile element
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('show');
        });

        // Close menu dynamically if the user clicks anywhere else outside of it
        document.addEventListener('click', (e) => {
            if (!trigger.contains(e.target) && !menu.contains(e.target)) {
                menu.classList.remove('show');
            }
        });
    }
});