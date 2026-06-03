document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
});

const API_BASE = '/api';
const token = localStorage.getItem('token');

if (!token) window.location.href = '/login';

// =========================================
// HEALING ROADMAP DATA
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
            posts: 0, sessions: 0, tasks: 0, chats: 0,
            waterStreak: 0, lastWatered: null, pendingReward: false
        };
    } catch {
        return { posts: 0, sessions: 0, tasks: 0, chats: 0, waterStreak: 0, lastWatered: null, pendingReward: false };
    }
}

function saveFlowerData(data) {
    localStorage.setItem(FLOWER_STORAGE_KEY, JSON.stringify(data));
}

function setAvatarImage(element, imageUrl, fallback) {
    if (!element) return;
    if (imageUrl) {
        element.textContent = '';
        element.style.backgroundImage = `url(${imageUrl})`;
        element.style.backgroundSize = 'cover';
        element.style.backgroundPosition = 'center';
    } else {
        element.textContent = fallback;
        element.style.backgroundImage = '';
    }
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
        seed.style.opacity = '0.9'; leaves.style.opacity = '0'; petals.style.opacity = '0';
        center.setAttribute('fill', '#fbbf24');
    } else if (stage === 1) {
        seed.style.opacity = '0'; leaves.style.opacity = '1'; petals.style.opacity = '0';
        center.setAttribute('fill', '#fbbf24');
    } else if (stage === 2) {
        seed.style.opacity = '0'; leaves.style.opacity = '1'; petals.style.opacity = '0.55';
        center.setAttribute('fill', '#fbbf24');
    } else {
        seed.style.opacity = '0'; leaves.style.opacity = '1'; petals.style.opacity = '1';
        center.setAttribute('fill', '#f59e0b');
    }
}

function createWaterDrop(delay = 0) {
    const wrap = document.querySelector('.flower-svg-wrap');
    if (!wrap) return;
    setTimeout(() => {
        const drop = document.createElement('div');
        drop.className = 'water-drop animate-drop';
        const offset = (Math.random() - 0.5) * 30;
        drop.style.left = `calc(50% + ${offset}px)`;
        wrap.appendChild(drop);
        setTimeout(() => drop.remove(), 1000);
    }, delay);
}

function triggerRewardShower() {
    createWaterDrop(0);
    createWaterDrop(300);
    createWaterDrop(600);
}

function renderFlowerWidget() {
    const d = loadFlowerData();
    let progressMade = false;

    const domPosts = parseInt(document.getElementById('stat-posts')?.textContent) || 0;
    if (domPosts > d.posts) progressMade = true;
    d.posts = Math.max(d.posts, domPosts);

    const domSessions = parseInt(document.getElementById('stat-sessions')?.textContent) || 0;
    if (domSessions > d.sessions) progressMade = true;
    d.sessions = Math.max(d.sessions, domSessions);

    const currentTasks = roadmapTasks.filter(t => t.completed).length;
    if (currentTasks > d.tasks) progressMade = true;
    d.tasks = Math.max(d.tasks, currentTasks);

    if (d.pendingReward) { progressMade = true; d.pendingReward = false; }
    if (progressMade) triggerRewardShower();

    const stage = getFlowerStageIndex(d);
    document.getElementById('stage-badge').textContent = flowerStages[stage].name;
    document.getElementById('stage-label').textContent = flowerStages[stage].label;
    renderFlowerSVG(stage);

    const clamp = (v, max) => Math.min(100, Math.round((v / max) * 100));
    document.getElementById('fp-posts').style.width    = clamp(d.posts, 3) + '%';
    document.getElementById('fp-sessions').style.width = clamp(d.sessions, 1) + '%';
    document.getElementById('fp-tasks').style.width    = clamp(d.tasks, 5) + '%';
    document.getElementById('fp-chats').style.width    = clamp(d.chats, 5) + '%';
    document.getElementById('fv-posts').textContent    = d.posts    + '/3';
    document.getElementById('fv-sessions').textContent = d.sessions + '/1';
    document.getElementById('fv-tasks').textContent    = d.tasks    + '/5';
    document.getElementById('fv-chats').textContent    = d.chats    + '/5';

    const today = new Date().toDateString();
    const alreadyWatered = d.lastWatered === today;
    const btn = document.getElementById('flower-water-btn');
    if (btn) {
        btn.disabled = alreadyWatered;
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

    createWaterDrop(0);
    setTimeout(() => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        d.waterStreak = d.lastWatered === yesterday.toDateString() ? d.waterStreak + 1 : 1;
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

function flowerIncrementChat() {
    const d = loadFlowerData();
    d.chats = (d.chats || 0) + 1;
    d.pendingReward = true;
    saveFlowerData(d);
}

// =========================================
// SESSION REVIEW MODAL
// =========================================

// State tracked per session
let _reviewAppointmentId   = null;
let _reviewTherapistName   = '';
let _reviewSelectedRating  = 0;

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

/**
 * Opens the review modal after a session ends.
 * @param {string} appointmentId  - MongoDB _id of the appointment
 * @param {string} therapistName  - Display name shown in the modal
 */
function openReviewModal(appointmentId, therapistName) {
    _reviewAppointmentId  = appointmentId;
    _reviewTherapistName  = therapistName || 'your therapist';
    _reviewSelectedRating = 0;

    // Reset UI
    document.getElementById('review-therapist-name').textContent = _reviewTherapistName;
    document.getElementById('review-textarea').value = '';
    document.getElementById('review-char-count').textContent = '0';
    document.getElementById('review-rating-label').textContent = 'Tap a star to rate';
    document.getElementById('review-rating-label').classList.remove('rated');
    document.getElementById('review-submit-btn').disabled = true;
    document.getElementById('review-modal-inner')?.classList.remove('submitted');
    _setStarHighlight(0);

    // Show
    document.getElementById('review-modal-overlay').classList.add('active');
    document.getElementById('review-modal').classList.add('active');
}

function closeReviewModal() {
    document.getElementById('review-modal-overlay').classList.remove('active');
    document.getElementById('review-modal').classList.remove('active');
}

/** Highlights stars up to `value` */
function _setStarHighlight(value) {
    document.querySelectorAll('.star-btn').forEach(btn => {
        const v = parseInt(btn.dataset.value);
        btn.classList.toggle('selected', v <= value);
        btn.classList.remove('hovered');
    });
}

/** Wires up all review modal interactivity — called once on DOMContentLoaded */
function initReviewModal() {
    const stars        = document.querySelectorAll('.star-btn');
    const textarea     = document.getElementById('review-textarea');
    const charCount    = document.getElementById('review-char-count');
    const ratingLabel  = document.getElementById('review-rating-label');
    const submitBtn    = document.getElementById('review-submit-btn');
    const skipBtn      = document.getElementById('review-skip-btn');
    const closeBtn     = document.getElementById('review-close-btn');
    const overlay      = document.getElementById('review-modal-overlay');

    if (!stars.length) return; // Guard: modal not in DOM

    // ── Star hover ──
    stars.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            const v = parseInt(btn.dataset.value);
            stars.forEach(s => s.classList.toggle('hovered', parseInt(s.dataset.value) <= v));
        });
        btn.addEventListener('mouseleave', () => {
            stars.forEach(s => s.classList.remove('hovered'));
        });

        // ── Star click ──
        btn.addEventListener('click', () => {
            _reviewSelectedRating = parseInt(btn.dataset.value);
            _setStarHighlight(_reviewSelectedRating);
            ratingLabel.textContent = RATING_LABELS[_reviewSelectedRating];
            ratingLabel.classList.add('rated');
            submitBtn.disabled = false;
        });
    });

    // ── Textarea char counter ──
    textarea.addEventListener('input', () => {
        charCount.textContent = textarea.value.length;
    });

    // ── Close / Skip ──
    closeBtn.addEventListener('click',  closeReviewModal);
    skipBtn.addEventListener('click',   closeReviewModal);
    overlay.addEventListener('click',   closeReviewModal);

    // ── Submit ──
    submitBtn.addEventListener('click', async () => {
        if (!_reviewSelectedRating || !_reviewAppointmentId) return;

        submitBtn.disabled = true;
        submitBtn.classList.add('submitting');
        submitBtn.textContent = 'Submitting…';

        try {
            const res = await fetch(`${API_BASE}/appointments/${_reviewAppointmentId}/review`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    rating: _reviewSelectedRating,
                    review: document.getElementById('review-textarea').value.trim()
                })
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || 'Failed to submit review');
            }

            // Success feedback before closing
            submitBtn.textContent = '✓ Submitted!';
            submitBtn.style.background = 'linear-gradient(135deg, #34c77b 0%, #16a34a 100%)';

            setTimeout(closeReviewModal, 1200);

        } catch (err) {
            console.error('Review submit error:', err);
            submitBtn.textContent = 'Submit Review';
            submitBtn.classList.remove('submitting');
            submitBtn.disabled = false;
            alert(err.message || 'Could not submit review. Please try again.');
        }
    });
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
        setAvatarImage(document.getElementById('large-avatar'), data.profileImage, name.charAt(0).toUpperCase());

        const navAvatar = document.querySelector('.user-avatar');
        setAvatarImage(navAvatar, data.profileImage, name.charAt(0).toUpperCase());

        document.getElementById('stat-posts').textContent = data.postCount || 0;

        if (data.createdAt) {
            const date = new Date(data.createdAt);
            document.getElementById('profile-since').textContent =
                `Member since ${date.toLocaleString('default', { month: 'long', year: 'numeric' })}`;
            document.getElementById('stat-days').textContent =
                Math.floor((Date.now() - date) / (1000 * 60 * 60 * 24));
        }
    } catch (err) {
        console.error('Profile load error:', err);
        document.getElementById('profile-name').textContent = 'Error loading profile';
    }
}

async function uploadAvatar(file) {
    const formData = new FormData();
    formData.append('profileImage', file);
    const response = await fetch(`${API_BASE}/upload/profile-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Could not upload avatar.');
    setAvatarImage(document.getElementById('large-avatar'), data.profileImage, 'U');
    setAvatarImage(document.querySelector('.user-avatar'), data.profileImage, 'U');
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

        const now = new Date();
        appointments = appointments.filter(a => {
            const sessionStart   = new Date(`${a.date}T${a.time}`);
            const sessionEnd     = new Date(sessionStart.getTime() + 60 * 60 * 1000);
            const updatedAt      = new Date(a.updatedAt || sessionStart);
            const minutesSinceUpdate = (now - updatedAt) / (1000 * 60);
            const minutesSinceEnd    = (now - sessionEnd)   / (1000 * 60);

            if (['canceled','cancelled','denied'].includes(a.status)) return minutesSinceUpdate <= 10;
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
            const diffMinutes     = (sessionDateTime - now) / (1000 * 60);

            let dateStr;
            if (sessionDateTime.toDateString() === now.toDateString()) {
                dateStr = `Today at ${sessionDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
            } else {
                dateStr = sessionDateTime.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            }

            const statusConfig = {
                pending:   { text: 'Pending Approval', bg: '#fef3c7', color: '#d97706' },
                approved:  { text: 'Approved',         bg: '#dcfce7', color: '#16a34a' },
                denied:    { text: 'Denied',           bg: '#fee2e2', color: '#dc2626' },
                cancelled: { text: 'Cancelled',        bg: '#f1f5f9', color: '#64748b' },
                canceled:  { text: 'Cancelled',        bg: '#f1f5f9', color: '#64748b' },
                completed: { text: 'Completed',        bg: '#e0e7ff', color: '#4f46e5' }
            };
            const badge    = statusConfig[a.status] || statusConfig.pending;
            const typeBadge = a.type === 'in-person'
                ? { text: 'In-Person', bg: '#dcfce7', color: '#16a34a' }
                : { text: 'Online',    bg: '#e0f2fe', color: '#0284c7' };

            const canJoin    = a.status === 'approved' && a.type === 'online' && diffMinutes <= 10 && diffMinutes >= -60;
            const isCancelled = ['cancelled','canceled','denied'].includes(a.status);
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

        // Store therapist name on the modal so "End Session" can pass it to the review
        const videoModal = document.getElementById('video-modal');
        videoModal.dataset.appointmentId  = appointmentId;
        videoModal.dataset.therapistName  = therapistName || 'your therapist';

        document.getElementById('video-modal-title').textContent = `Session with ${therapistName}`;
        document.getElementById('daily-iframe').src = data.url;
        videoModal.classList.add('active');
        document.getElementById('video-modal-overlay').classList.add('active');
    } catch (err) {
        alert('Failed to join session. Please try again.');
        console.error('Join error:', err);
    }
}

// =========================================
// CLOSE VIDEO MODAL → trigger review
// =========================================
document.getElementById('close-video-modal')?.addEventListener('click', () => {
    const videoModal     = document.getElementById('video-modal');
    const appointmentId  = videoModal.dataset.appointmentId;
    const therapistName  = videoModal.dataset.therapistName || 'your therapist';

    // Tear down video call
    document.getElementById('daily-iframe').src = '';
    videoModal.classList.remove('active');
    document.getElementById('video-modal-overlay').classList.remove('active');

    // Small delay so video modal fully disappears before review modal appears
    if (appointmentId) {
        setTimeout(() => openReviewModal(appointmentId, therapistName), 350);
    }
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
    initReviewModal();         // ← wire up review modal events
    renderRoadmap();
    await Promise.all([loadProfile(), loadUpcomingAppointments()]);
    renderFlowerWidget();
    if (typeof lucide !== 'undefined') lucide.createIcons();
});

document.getElementById('avatar-upload-input')?.addEventListener('change', async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
        await uploadAvatar(file);
    } catch (error) {
        alert(error.message);
    } finally {
        event.target.value = '';
    }
});

function refreshIcons() {
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

window.addEventListener('load', () => {
    refreshIcons();
});