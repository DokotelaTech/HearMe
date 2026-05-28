<<<<<<< HEAD
const API_BASE = 'http://localhost:5000/api';
const token = localStorage.getItem('token');

if (!token) window.location.href = '/login';

// =========================================
// HEALING ROADMAP DATA
// =========================================
const roadmapTasks = [
    { id: 1, title: "Practice daily gratitude", desc: "Write down 3 things you're grateful for each morning", tag: "Daily Practice", completed: true },
    { id: 2, title: "Join a support group", desc: "Connect with others who share similar experiences", tag: "Community", completed: true },
    { id: 3, title: "Try breathing exercises", desc: "Practice the 4-4-4 breathing technique when feeling anxious", tag: "Stress Management", completed: false },
    { id: 4, title: "Schedule a session", desc: "Book your first session with a verified social worker", tag: "Professional Support", completed: false },
    { id: 5, title: "Share your success", desc: "Post a success story to inspire others in the community", tag: "Give Back", completed: false }
];

const achievementsData = [
    { icon: '🌱', title: 'First Step', desc: 'Joined the HearMe community' },
    { icon: '💬', title: 'Opened Up', desc: 'Made your first post' },
    { icon: '🤝', title: 'Connected', desc: 'Joined a support group' }
];

// =========================================
// LOAD PROFILE FROM DATABASE
// =========================================
async function loadProfile() {
    try {
        const res = await fetch(`${API_BASE}/user/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();

        const name = data.identifier || 'Anonymous User';
        document.getElementById('profile-name').textContent = name;
        document.getElementById('large-avatar').textContent = name.charAt(0).toUpperCase();

        const navAvatar = document.querySelector('.user-avatar');
        if (navAvatar) navAvatar.textContent = name.charAt(0).toUpperCase();

        document.getElementById('stat-posts').textContent = data.postCount || 0;

        if (data.createdAt) {
            const date = new Date(data.createdAt);
            document.getElementById('profile-since').textContent =
                `Member since ${date.toLocaleString('default', { month: 'long', year: 'numeric' })}`;
            const days = Math.floor((Date.now() - date) / (1000 * 60 * 60 * 24));
            document.getElementById('stat-days').textContent = days;
        }
    } catch (err) {
        console.error('Profile load error:', err);
        document.getElementById('profile-name').textContent = 'Error loading profile';
    }
}

// =========================================
// LOAD APPOINTMENTS
// =========================================
async function loadUpcomingAppointments() {
    const container = document.getElementById('dynamic-events');
    if (!container) return;

    try {
        const res = await fetch(`${API_BASE}/appointments/my`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch appointments');

        const data = await res.json();
        const appointments = data.appointments || [];

        // Stat: count only approved sessions
        const approvedCount = appointments.filter(a => a.status === 'approved').length;
        const statEl = document.getElementById('stat-sessions');
        if (statEl) statEl.textContent = approvedCount;

        if (appointments.length === 0) {
            container.innerHTML = `
                <p style="text-align:center; padding:20px; color:#64748b;">
                    No upcoming sessions yet.<br><br>
                    <a href="/user/experts" style="background:#a855f7; color:white; padding:8px 16px; border-radius:8px; text-decoration:none;">Book one now</a>
                </p>`;
            return;
        }

        container.innerHTML = appointments.map(a => {
            const sessionDateTime = new Date(`${a.date}T${a.time}`);
            const now = new Date();
            const diffMinutes = (sessionDateTime - now) / (1000 * 60);

            // Format date string
            let dateStr;
            if (sessionDateTime.toDateString() === now.toDateString()) {
                dateStr = `Today at ${sessionDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
            } else {
                dateStr = sessionDateTime.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            }

            // Status badge config
            const statusConfig = {
                pending:   { text: 'Pending Approval', bg: '#fef3c7', color: '#d97706' },
                approved:  { text: 'Approved',         bg: '#dcfce7', color: '#16a34a' },
                denied:    { text: 'Denied',            bg: '#fee2e2', color: '#dc2626' },
                cancelled: { text: 'Cancelled',         bg: '#f1f5f9', color: '#64748b' },
                completed: { text: 'Completed',         bg: '#e0e7ff', color: '#4f46e5' }
            };
            const badge = statusConfig[a.status] || statusConfig.pending;

            // Type badge
            const typeBadge = a.type === 'in-person'
                ? { text: 'In-Person', bg: '#dcfce7', color: '#16a34a' }
                : { text: 'Online', bg: '#e0f2fe', color: '#0284c7' };

            // Can user join? Only 10 min before and up to 60 min after start
            const canJoin = a.status === 'approved' && a.type === 'online' && diffMinutes <= 10 && diffMinutes >= -60;

            // Cancelled sessions get a muted look
            const isCancelled = a.status === 'cancelled' || a.status === 'denied';
            const cardOpacity = isCancelled ? 'opacity: 0.6;' : '';

            return `
                <div style="background:#15dd80c1; border:1px solid #0e1ba9; border-radius:12px; padding:16px; margin-bottom:16px; ${cardOpacity}">
                    <div style="display:flex; align-items:flex-start; gap:14px;">

                        <div style="background:${isCancelled ? '#e2f0e5' : '#a855f7'}; color:white; width:44px; height:44px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:1.2rem;">
                            <i data-lucide="calendar"></i>
                        </div>

                        <div style="flex:1; min-width:0;">
                            <p style="margin:0 0 4px 0; font-weight:700; font-size:0.95rem; color:#0f172a;">
                                Session with ${a.therapistName || 'Therapist'}
                            </p>
                            <p style="margin:0 0 10px 0; font-size:0.82rem; color:#64748b;">${dateStr}</p>

                            <div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center; justify-content:space-between;">
                                <div style="display:flex; gap:6px;">
                                    <span style="background:${badge.bg}; color:${badge.color}; padding:3px 10px; border-radius:20px; font-size:0.72rem; font-weight:600;">
                                        ${badge.text}
                                    </span>
                                    <span style="background:${typeBadge.bg}; color:${typeBadge.color}; padding:3px 10px; border-radius:20px; font-size:0.72rem; font-weight:600;">
                                        ${typeBadge.text}
                                    </span>
                                </div>

                                ${!isCancelled ? `
                                <div style="display:flex; gap:8px;">
                                    <button onclick="cancelSession('${a._id}')"
                                        style="background:#fee2e2; color:#ef4444; border:none; padding:6px 14px; border-radius:8px; font-size:0.8rem; font-weight:600; cursor:pointer;">
                                        Cancel
                                    </button>

                                    ${canJoin
                                        ? `<button onclick="joinSession('${a._id}', '${a.therapistName}')"
                                               style="background:#0ea5e9; color:white; border:none; padding:6px 14px; border-radius:8px; font-size:0.8rem; font-weight:600; cursor:pointer;">
                                               Join Call
                                           </button>`
                                        : `<button disabled
                                               style="background:#e2e8f0; color:#94a3b8; border:none; padding:6px 14px; border-radius:8px; font-size:0.8rem; font-weight:600; cursor:not-allowed;">
                                               Join Call
                                           </button>`
                                    }
                                </div>` : ''}
                            </div>
                        </div>
                    </div>
                </div>`;
        }).join('');

        if (typeof lucide !== 'undefined') lucide.createIcons();

    } catch (err) {
        console.error('Appointments load error:', err);
        if (container) container.innerHTML = '<p style="text-align:center; color:#64748b; padding:20px;">Could not load sessions.</p>';
    }
}

// =========================================
// CANCEL SESSION
// Sets to 'cancelled' in DB, stays visible as cancelled
// =========================================
async function cancelSession(appointmentId) {
    if (!confirm('Are you sure you want to cancel this session?')) return;

    try {
        const res = await fetch(`${API_BASE}/appointments/${appointmentId}/cancel`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to cancel');

        // Reload appointments so the card updates to show "Cancelled" badge
        loadUpcomingAppointments();

    } catch (err) {
        alert(err.message);
        console.error('Cancel error:', err);
    }
}

// =========================================
// JOIN SESSION — opens Daily.co modal
// =========================================
async function joinSession(appointmentId, therapistName) {
    try {
        const res = await fetch(`${API_BASE}/appointments/${appointmentId}/join`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();
        if (!res.ok) {
            alert(data.message);
            return;
        }

        document.getElementById('video-modal-title').textContent = `Session with ${therapistName}`;
        document.getElementById('daily-iframe').src = data.url;
        document.getElementById('video-modal').classList.add('active');
        document.getElementById('video-modal-overlay').classList.add('active');

    } catch (err) {
        alert('Failed to join session. Please try again.');
        console.error('Join error:', err);
    }
}

// =========================================
// CLOSE VIDEO MODAL
// =========================================
document.getElementById('close-video-modal')?.addEventListener('click', () => {
    document.getElementById('daily-iframe').src = '';
    document.getElementById('video-modal').classList.remove('active');
    document.getElementById('video-modal-overlay').classList.remove('active');
});

// =========================================
// ROADMAP
// =========================================
function renderRoadmap() {
    const taskContainer = document.getElementById('roadmap-task-list');
    if (!taskContainer) return;

    taskContainer.innerHTML = roadmapTasks.map(task => `
        <div class="${task.completed ? 'task-item completed' : 'task-item'}" data-id="${task.id}">
            <div class="task-left">
                <div class="task-check">
                    ${task.completed
                        ? '<i data-lucide="check-circle-2" style="color:#15803d;"></i>'
                        : '<div class="circle-outline"></div>'}
                </div>
                <div class="task-text">
                    <h4>${task.title}</h4>
                    <p>${task.desc}</p>
                </div>
            </div>
            <span class="task-tag tag-${task.tag.toLowerCase().replace(/\s+/g, '-')}">${task.tag}</span>
        </div>`
    ).join('');

    calculateProgress();
    if (typeof lucide !== 'undefined') lucide.createIcons();
    attachRoadmapListeners();
}

function calculateProgress() {
    const total = roadmapTasks.length;
    const done = roadmapTasks.filter(t => t.completed).length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    const bar = document.getElementById('progress-bar');
    const text = document.getElementById('progress-text');
    if (bar) bar.style.width = `${pct}%`;
    if (text) text.textContent = `${pct}% Complete`;
}

function attachRoadmapListeners() {
    document.querySelectorAll('.task-item').forEach(item => {
        item.onclick = function () {
            const task = roadmapTasks.find(t => t.id === parseInt(this.getAttribute('data-id')));
            if (task) { task.completed = !task.completed; renderRoadmap(); }
        };
    });
}

// =========================================
// ACHIEVEMENTS
// =========================================
function renderAchievements() {
    const container = document.getElementById('dynamic-achievements');
    if (!container) return;
    container.innerHTML = achievementsData.map(a => `
        <div class="ach-box">
            <div class="ach-icon">${a.icon}</div>
            <div><h4>${a.title}</h4><p>${a.desc}</p></div>
        </div>`
    ).join('');
}

// =========================================
// DROPDOWN
// =========================================
function initDropdown() {
    const trigger = document.getElementById('dropdownTrigger');
    const menu = document.getElementById('dropdownMenu');
    if (!trigger || !menu) return;
    trigger.addEventListener('click', e => { e.stopPropagation(); menu.classList.toggle('show'); });
    document.addEventListener('click', e => {
        if (!trigger.contains(e.target) && !menu.contains(e.target)) menu.classList.remove('show');
    });
}

// =========================================
// LOGOUT
// =========================================
document.getElementById('logout-btn')?.addEventListener('click', e => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
});

// =========================================
// PAGE TRANSITIONS
// =========================================
document.querySelectorAll('a.nav-item').forEach(link => {
    link.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href && !href.startsWith('#')) {
            e.preventDefault();
            document.body.classList.add('fade-out');
            setTimeout(() => { window.location.href = href; }, 300);
        }
    });
});

// =========================================
// INIT
// =========================================
document.addEventListener('DOMContentLoaded', async () => {
    initDropdown();
    renderRoadmap();
    renderAchievements();
    await Promise.all([loadProfile(), loadUpcomingAppointments()]);
    if (typeof lucide !== 'undefined') lucide.createIcons();
=======
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
>>>>>>> fb42d70 ("user-profiles" "Therapistportal")
});