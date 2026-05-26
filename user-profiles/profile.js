const API_BASE = 'http://localhost:5000/api';
const token = localStorage.getItem('token');

// Redirect if not logged in
if (!token) {
    window.location.href = '/login';
}

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
            document.getElementById('profile-since').textContent = `Member since ${date.toLocaleString('default', { month: 'long', year: 'numeric' })}`;
            const days = Math.floor((Date.now() - date) / (1000 * 60 * 60 * 24));
            document.getElementById('stat-days').textContent = days;
        }
    } catch (err) {
        console.error('Profile load error:', err);
        document.getElementById('profile-name').textContent = 'Error loading profile';
    }
}

// =========================================
// LOAD UPCOMING APPOINTMENTS
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
        
        // Filter out canceled/denied sessions for the normal user's view
        const appointments = (data.appointments || []).filter(a => a.status === 'approved' || a.status === 'pending');

        const statElement = document.getElementById('stat-sessions');
        if(statElement) statElement.textContent = appointments.filter(a => a.status === 'approved').length;

        if (appointments.length === 0) {
            container.innerHTML = `
                <p class="empty-state" style="text-align: center; padding: 20px; color: #64748b;">
                    No upcoming sessions yet.
                    <br><br>
                    <a href="/user/experts" style="background: #a855f7; color: white; padding: 8px 16px; border-radius: 8px; text-decoration: none;">Book one now</a>
                </p>`;
            return;
        }

        let htmlOutput = `
            <div style="margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                <i class="fa-regular fa-bell" style="color: #a855f7; font-size: 1.2rem;"></i>
                <h3 style="margin: 0; color: #0f172a; font-size: 1.2rem; font-weight: 700;"></h3>
            </div>
        `;

        htmlOutput += appointments.map(a => {
            const sessionDateTime = new Date(`${a.date}T${a.time}`);
            const now = new Date();
            const diffMinutes = (sessionDateTime - now) / (1000 * 60);

            let dateStr = "";
            if (sessionDateTime.toDateString() === now.toDateString()) {
                dateStr = `Today at ${sessionDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
            } else {
                dateStr = sessionDateTime.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                dateStr = dateStr.replace(',', ' at');
            }

            const canJoin = a.status === 'approved' && a.type === 'online' && diffMinutes <= 10 && diffMinutes >= -60;
            
            const btnActiveStyle = "background: #0ea5e9; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 0.85rem; box-shadow: 0 2px 4px rgba(14, 165, 233, 0.2); transition: 0.2s;";
            const btnDisabledStyle = "background: #e2e8f0; color: #94a3b8; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: not-allowed; display: flex; align-items: center; gap: 6px; font-size: 0.85rem;";
            const btnCancelStyle = "background: #fee2e2; color: #ef4444; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 0.85rem; transition: 0.2s;";

            let tagText = a.status === 'pending' ? "Pending" : "Session";
            let tagBg = a.status === 'pending' ? "#fef3c7" : "#f3e8ff"; 
            let tagColor = a.status === 'pending' ? "#d97706" : "#9333ea"; 
            
            if (a.type === 'in-person') {
                tagText = "In-Person"; tagBg = "#dcfce7"; tagColor = "#16a34a";
            }

            return `
                <div style="background: #14bf6ad5; border: 1px solid #f3e8ff; border-radius: 12px; padding: 16px; margin-bottom: 16px; display: flex; align-items: flex-start; gap: 16px;">
                    <div style="background: #a855f7; color: white; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 1.3rem;">
                        <i class="fa-regular fa-calendar"></i>
                    </div>
                    <div style="flex-grow: 1;">
                        <h4 style="margin: 0 0 6px 0; color: #112f75; font-size: 1rem; font-weight: 700; line-height: 1.3;">
                            1-on-1 Session with ${a.therapistName || 'Therapist'}
                        </h4>
                        <p style="margin: 0 0 12px 0; color: #64748b; font-size: 0.85rem;">
                            ${dateStr}
                        </p>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="background: ${tagBg}; color: ${tagColor}; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">
                                ${tagText}
                            </span>
                            
                            <div style="display: flex; gap: 8px;">
                                <button onclick="cancelSession('${a._id}')" style="${btnCancelStyle}">
                                    <i class="fa-solid fa-xmark"></i> Cancel
                                </button>
                                
                                ${canJoin 
                                    ? `<button onclick="joinSession('${a._id}', '${a.therapistName}')" style="${btnActiveStyle}">
                                           <i class="fa-solid fa-video"></i> Join Call
                                       </button>`
                                    : `<button disabled style="${btnDisabledStyle}">
                                           <i class="fa-solid fa-video"></i> Join Call
                                       </button>`
                                }
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = htmlOutput;
        if(typeof lucide !== 'undefined') lucide.createIcons();

    } catch (err) {
        console.error('Appointments load error:', err);
        if (container) container.innerHTML = '<p class="empty-state">Could not load sessions.</p>';
    }
}

// =========================================
// CANCEL SESSION API CALL
// =========================================
async function cancelSession(appointmentId) {
    if (!confirm("Are you sure you want to cancel this session? This action cannot be undone.")) return;

    try {
        const res = await fetch(`${API_BASE}/appointments/${appointmentId}/cancel`, {
            method: 'PATCH',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'canceled' })
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || 'Failed to cancel session');
        }

        // Successfully canceled in database, reload UI so it disappears
        loadUpcomingAppointments();

    } catch (err) {
        alert(err.message);
        console.error('Cancel session error:', err);
    }
}

// =========================================
// JOIN SESSION
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
        console.error('Join session error:', err);
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
// ROADMAP RENDERING
// =========================================
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
    if(typeof lucide !== 'undefined') lucide.createIcons();
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
            const taskId = parseInt(this.getAttribute('data-id'));
            const task = roadmapTasks.find(t => t.id === taskId);
            if (task) {
                task.completed = !task.completed;
                renderRoadmap();
            }
        };
    });
}

// =========================================
// ACHIEVEMENTS RENDERING
// =========================================
function renderAchievements() {
    const container = document.getElementById('dynamic-achievements');
    if (!container) return;
    container.innerHTML = achievementsData.map(a => `
        <div class="ach-box">
            <div class="ach-icon">${a.icon}</div>
            <div>
                <h4>${a.title}</h4>
                <p>${a.desc}</p>
            </div>
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

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
        if (!trigger.contains(e.target) && !menu.contains(e.target)) {
            menu.classList.remove('show');
        }
    });
}

// =========================================
// LOGOUT
// =========================================
document.getElementById('logout-btn')?.addEventListener('click', (e) => {
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

    await Promise.all([
        loadProfile(),
        loadUpcomingAppointments()
    ]);

    if(typeof lucide !== 'undefined') lucide.createIcons();
});