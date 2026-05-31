const API_BASE = 'http://localhost:5000/api';
const token = localStorage.getItem('token');

if (!token) window.location.href = '/login';

// =========================================
// HEALING ROADMAP DATA (Starts completely empty)
// =========================================
let roadmapTasks = [
    { id: 1, title: "Practice daily gratitude", desc: "Write down 3 things you're grateful for each morning", tag: "Daily Practice", completed: false },
    { id: 2, title: "Join a support group", desc: "Connect with others who share similar experiences", tag: "Community", completed: false },
    { id: 3, title: "Try breathing exercises", desc: "Practice the 4-4-4 breathing technique when feeling anxious", tag: "Stress Management", completed: false },
    { id: 4, title: "Schedule a session", desc: "Book your first session with a verified social worker", tag: "Professional Support", completed: false },
    { id: 5, title: "Share your success", desc: "Post a success story to inspire others in the community", tag: "Give Back", completed: false }
];

// =========================================
// HEALING FLOWER & GAMIFICATION
// =========================================

// Generate a UNIQUE key per user so accounts don't share the same flower data
const FLOWER_STORAGE_KEY = `hearme_flower_${token ? token.substring(token.length - 15) : 'default'}`;

const flowerStages = [
    { name: '🌱 Seed',    label: 'Keep going — your flower is just getting started' },
    { name: '🌿 Sprout',  label: "You're growing! Book a session to keep going" },
    { name: '🌸 Budding', label: "Beautiful — you're nearly in full bloom" },
    { name: '🌺 Blooming',label: "You're in full bloom. Keep shining 🌟" }
];

function loadFlowerData() {
    try {
        const raw = localStorage.getItem(FLOWER_STORAGE_KEY);
        return raw ? JSON.parse(raw) : {
            posts: 0,
            sessions: 0,
            tasks: 0,
            chats: 0,
            waterStreak: 0,
            lastWatered: null,
            pendingReward: false // Tracks if AI chat happened off-page
        };
    } catch { return { posts: 0, sessions: 0, tasks: 0, chats: 0, waterStreak: 0, lastWatered: null, pendingReward: false }; }
}

function saveFlowerData(data) {
    localStorage.setItem(FLOWER_STORAGE_KEY, JSON.stringify(data));
}

function getFlowerStageIndex(d) {
    if (d.waterStreak >= 7 && d.posts >= 3 && d.sessions >= 1 && d.tasks >= 5 && d.chats >= 5) return 3;
    if (d.posts >= 3 && d.sessions >= 1 && d.tasks >= 5 && d.chats >= 5) return 2;
    if (d.posts >= 3 && d.sessions >= 1) return 1;
    return 0;
}

function renderFlowerSVG(stage) {
    const petals = document.getElementById('flower-petals');
    const leaves = document.getElementById('flower-leaves');
    const seed   = document.getElementById('flower-seed');
    const center = document.getElementById('flower-center');
    if (!petals) return;

    if (stage === 0) {
        seed.style.opacity   = '0.9';
        leaves.style.opacity = '0';
        petals.style.opacity = '0';
        center.setAttribute('fill', '#fbbf24');
    } else if (stage === 1) {
        seed.style.opacity   = '0';
        leaves.style.opacity = '1';
        petals.style.opacity = '0';
        center.setAttribute('fill', '#fbbf24');
    } else if (stage === 2) {
        seed.style.opacity   = '0';
        leaves.style.opacity = '1';
        petals.style.opacity = '0.55';
        center.setAttribute('fill', '#fbbf24');
    } else {
        seed.style.opacity   = '0';
        leaves.style.opacity = '1';
        petals.style.opacity = '1';
        center.setAttribute('fill', '#f59e0b');
    }
}

// 💧 DYNAMIC WATER DROPLET GENERATOR
function createWaterDrop(delay = 0) {
    const wrap = document.querySelector('.flower-svg-wrap');
    if (!wrap) return;

    setTimeout(() => {
        const drop = document.createElement('div');
        drop.className = 'water-drop animate-drop';
        
        // Randomize the drop horizontally so it looks like a shower
        const offset = (Math.random() - 0.5) * 30; // Between -15px and +15px
        drop.style.left = `calc(50% + ${offset}px)`;
        
        wrap.appendChild(drop);

        // Remove from DOM after animation completes (1s)
        setTimeout(() => drop.remove(), 1000);
    }, delay);
}

function triggerRewardShower() {
    // Drop 3 droplets in a sequence
    createWaterDrop(0);
    createWaterDrop(300);
    createWaterDrop(600);
}

function renderFlowerWidget() {
    const d = loadFlowerData();
    let progressMade = false;

    // 1. Check for Posts Progress
    const domPosts = parseInt(document.getElementById('stat-posts')?.textContent) || 0;
    if (domPosts > d.posts) progressMade = true;
    d.posts = Math.max(d.posts, domPosts);

    // 2. Check for Sessions Progress
    const domSessions = parseInt(document.getElementById('stat-sessions')?.textContent) || 0;
    if (domSessions > d.sessions) progressMade = true;
    d.sessions = Math.max(d.sessions, domSessions);

    // 3. Check for Tasks Progress
    const currentTasks = roadmapTasks.filter(t => t.completed).length;
    if (currentTasks > d.tasks) progressMade = true;
    d.tasks = Math.max(d.tasks, currentTasks);

    // 4. Check for off-page AI chat progress
    if (d.pendingReward) {
        progressMade = true;
        d.pendingReward = false; // Reset it
    }

    // 🔥 IF THEY PROGRESSED SINCE LAST VISIT, REWARD THEM!
    if (progressMade) {
        triggerRewardShower();
    }

    const stage = getFlowerStageIndex(d);

    document.getElementById('stage-badge').textContent = flowerStages[stage].name;
    document.getElementById('stage-label').textContent = flowerStages[stage].label;
    renderFlowerSVG(stage);

    // Progress bars
    const clamp = (v, max) => Math.min(100, Math.round((v / max) * 100));
    document.getElementById('fp-posts').style.width    = clamp(d.posts, 3) + '%';
    document.getElementById('fp-sessions').style.width = clamp(d.sessions, 1) + '%';
    document.getElementById('fp-tasks').style.width    = clamp(d.tasks, 5) + '%';
    document.getElementById('fp-chats').style.width    = clamp(d.chats, 5) + '%';

    document.getElementById('fv-posts').textContent    = d.posts    + '/3';
    document.getElementById('fv-sessions').textContent = d.sessions + '/1';
    document.getElementById('fv-tasks').textContent    = d.tasks    + '/5';
    document.getElementById('fv-chats').textContent    = d.chats    + '/5';

    // Water button state
    const today = new Date().toDateString();
    const alreadyWatered = d.lastWatered === today;
    const btn = document.getElementById('flower-water-btn');
    if (btn) {
        btn.disabled   = alreadyWatered;
        btn.textContent = alreadyWatered ? 'Watered today' : 'Water today';
    }

    if (alreadyWatered) {
        const msg = document.getElementById('flower-watered-msg');
        if (msg) msg.textContent = `${d.waterStreak} day streak — come back tomorrow!`;
    }

    saveFlowerData(d);
}

function flowerWaterToday() {
    const d = loadFlowerData();
    const today = new Date().toDateString();
    if (d.lastWatered === today) return;

    // Trigger one single drop immediately for the manual watering
    createWaterDrop(0);

    // Delay updating the UI text/state until the drop visually hits the soil (800ms)
    setTimeout(() => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const wasYesterday = d.lastWatered === yesterday.toDateString();

        d.waterStreak = wasYesterday ? d.waterStreak + 1 : 1;
        d.lastWatered = today;
        saveFlowerData(d);

        const btn = document.getElementById('flower-water-btn');
        if (btn) { btn.disabled = true; btn.textContent = 'Watered today'; }

        const msg = document.getElementById('flower-watered-msg');
        if (msg) msg.textContent = `${d.waterStreak} day streak — come back tomorrow!`;

        renderFlowerWidget();
    }, 800); 
}

function flowerToggleInfo() {
    document.getElementById('flower-info-panel')?.classList.toggle('open');
}

// NOTE: Call this inside your AI Chat Javascript file whenever they send a message
function flowerIncrementChat() {
    const d = loadFlowerData();
    d.chats = (d.chats || 0) + 1;
    d.pendingReward = true; // Flags it so they see drops when they return to profile
    saveFlowerData(d);
}

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
        let appointments = data.appointments || [];

        // ==========================================
        // SMART FILTER: Remove old/canceled sessions
        // ==========================================
        const now = new Date();
        appointments = appointments.filter(a => {
            const sessionStart = new Date(`${a.date}T${a.time}`);
            const sessionEnd = new Date(sessionStart.getTime() + 60 * 60 * 1000); 
            const updatedAt = new Date(a.updatedAt || sessionStart);
            
            const minutesSinceUpdate = (now - updatedAt) / (1000 * 60);
            const minutesSinceEnd = (now - sessionEnd) / (1000 * 60);

            if (a.status === 'canceled' || a.status === 'cancelled' || a.status === 'denied') return minutesSinceUpdate <= 10; 
            if (a.status === 'completed') return minutesSinceUpdate <= 10;
            if (minutesSinceEnd > 10) return false; 

            return true;
        });

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
            const diffMinutes = (sessionDateTime - now) / (1000 * 60);

            let dateStr;
            if (sessionDateTime.toDateString() === now.toDateString()) {
                dateStr = `Today at ${sessionDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
            } else {
                dateStr = sessionDateTime.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            }

            const statusConfig = {
                pending:   { text: 'Pending Approval', bg: '#fef3c7', color: '#d97706' },
                approved:  { text: 'Approved',         bg: '#dcfce7', color: '#16a34a' },
                denied:    { text: 'Denied',            bg: '#fee2e2', color: '#dc2626' },
                cancelled: { text: 'Cancelled',         bg: '#f1f5f9', color: '#64748b' },
                canceled:  { text: 'Cancelled',         bg: '#f1f5f9', color: '#64748b' },
                completed: { text: 'Completed',         bg: '#e0e7ff', color: '#4f46e5' }
            };
            const badge = statusConfig[a.status] || statusConfig.pending;

            const typeBadge = a.type === 'in-person'
                ? { text: 'In-Person', bg: '#dcfce7', color: '#16a34a' }
                : { text: 'Online',    bg: '#e0f2fe', color: '#0284c7' };

            const canJoin = a.status === 'approved' && a.type === 'online' && diffMinutes <= 10 && diffMinutes >= -60;
            const isCancelled = ['cancelled', 'canceled', 'denied'].includes(a.status);
            const cardOpacity = isCancelled ? 'opacity: 0.6;' : '';

            return `
                <div style="background:#faf5ff; border:1px solid #f3e8ff; border-radius:12px; padding:16px; margin-bottom:16px; ${cardOpacity}">
                    <div style="display:flex; align-items:flex-start; gap:14px;">
                        <div style="background:${isCancelled ? '#e2e8f0' : '#a855f7'}; color:${isCancelled ? '#94a3b8' : 'white'}; width:44px; height:44px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:1.2rem;">
                            <i data-lucide="calendar"></i>
                        </div>
                        <div style="flex:1; min-width:0;">
                            <p style="margin:0 0 4px 0; font-weight:700; font-size:0.95rem; color:#0f172a;">
                                Session with ${a.therapistName || 'Therapist'}
                            </p>
                            <p style="margin:0 0 10px 0; font-size:0.82rem; color:#64748b;">${dateStr}</p>
                            <div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center; justify-content:space-between;">
                                <div style="display:flex; gap:6px;">
                                    <span style="background:${badge.bg}; color:${badge.color}; padding:3px 10px; border-radius:20px; font-size:0.72rem; font-weight:600;">${badge.text}</span>
                                    <span style="background:${typeBadge.bg}; color:${typeBadge.color}; padding:3px 10px; border-radius:20px; font-size:0.72rem; font-weight:600;">${typeBadge.text}</span>
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
        if (!res.ok) { alert(data.message); return; }

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
    const done  = roadmapTasks.filter(t => t.completed).length;
    const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
    const bar   = document.getElementById('progress-bar');
    const text  = document.getElementById('progress-text');
    if (bar)  bar.style.width  = `${pct}%`;
    if (text) text.textContent = `${pct}% Complete`;
}

function attachRoadmapListeners() {
    document.querySelectorAll('.task-item').forEach(item => {
        item.onclick = function () {
            const task = roadmapTasks.find(t => t.id === parseInt(this.getAttribute('data-id')));
            if (task) {
                task.completed = !task.completed;
                renderRoadmap();
                // Manually trigger shower because tasks update locally without a page reload
                if (task.completed) triggerRewardShower();
                renderFlowerWidget();
            }
        };
    });
}

// =========================================
// DROPDOWN
// =========================================
function initDropdown() {
    const trigger = document.getElementById('dropdownTrigger');
    const menu    = document.getElementById('dropdownMenu');
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
    await Promise.all([loadProfile(), loadUpcomingAppointments()]);
    // Render flower after profile + sessions have loaded so stats are populated
    renderFlowerWidget();
    if (typeof lucide !== 'undefined') lucide.createIcons();
});