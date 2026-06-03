const apiBaseUrl = '/api';
const authToken = localStorage.getItem('token');
const appointmentsContainer = document.getElementById('appointments-list-container');

if (!authToken) {
    window.location.href = '/login';
}

// =========================================
// LOAD ALL APPOINTMENTS
// =========================================
async function loadTherapistAppointments() {
    if (!appointmentsContainer) return;

    try {
        const response = await fetch(`${apiBaseUrl}/appointments/therapist`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!response.ok) throw new Error('Failed to fetch appointments');

        const data = await response.json();
        const all = data.appointments || [];

        const pending = all.filter(a => a.status === 'pending');
        const approved = all.filter(a => a.status === 'approved' || a.status === 'confirmed');

        updateDashboardStats(approved, pending);
        renderSchedule(approved);

    } catch (error) {
        console.error('Appointments load error:', error);
        appointmentsContainer.innerHTML = `
            <p class="muted text-sm" style="text-align:center;">
                Could not load schedule.
            </p>`;
    }
}

// =========================================
// RENDER CONFIRMED SESSIONS (Filters out sessions > 60 mins old)
// =========================================
function renderSchedule(appointmentsList) {
    appointmentsContainer.innerHTML = '';

    // 1. Filter out appointments that started more than 60 minutes ago
    const activeAndUpcoming = appointmentsList.filter(a => {
        const sessionDateTime = new Date(`${a.date}T${a.time}`);
        const now = new Date();
        const diffMinutes = (sessionDateTime - now) / (1000 * 60);
        
        // Keep it ONLY if diffMinutes is greater than or equal to -60
        return diffMinutes >= -60;
    });

    // 2. Check if the filtered list is empty
    if (activeAndUpcoming.length === 0) {
        appointmentsContainer.innerHTML = `
            <div style="padding:30px; text-align:center; color:#64748b; background:#f8fafc; border-radius:8px; border:1px dashed #cbd5e1;">
                No upcoming sessions scheduled.
            </div>`;
        return;
    }

    // 3. Map over the filtered list to draw the cards
    appointmentsContainer.innerHTML = activeAndUpcoming.map(a => {
        const sessionDateTime = new Date(`${a.date}T${a.time}`);
        const now = new Date();
        const diffMinutes = (sessionDateTime - now) / (1000 * 60);

        let actionHtml = '';

        if (a.type === 'online' && (a.isEmergency || (diffMinutes <= 10 && diffMinutes >= -60))) {
            actionHtml = `
                <button onclick="startSessionAndNotify('${a._id}', '${a.userName || a.clientName}', '${a.userId}')"
                    style="background:${a.isEmergency ? '#dc2626' : '#0ea5e9'}; color:white; border:none; padding:10px 18px; border-radius:6px; cursor:pointer; font-weight:700; display:flex; align-items:center; gap:8px;">
                    <i class="fa-solid ${a.isEmergency ? 'fa-phone-volume' : 'fa-video'}"></i> ${a.isEmergency ? 'Start Emergency Call' : 'Start Call'}
                </button>`;
        } else if (a.type === 'online' && diffMinutes > 10) {
            actionHtml = `
                <span style="color:#64748b; font-size:0.85rem;">
                    <i class="fa-regular fa-clock"></i> Starts in ${Math.round(diffMinutes)} min
                </span>`;
        } else {
            actionHtml = `
                <span style="background:#f1f5f9; padding:6px 12px; border-radius:4px; color:#475569; font-size:0.85rem;">
                    <i class="fa-solid fa-location-dot"></i> In-Person
                </span>`;
        }

        return `
            <div id="appointment-${a._id}" style="border:${a.isEmergency ? '2px solid #ef4444' : '1px solid #e2e8f0'}; border-left:4px solid ${a.isEmergency ? '#dc2626' : '#0ea5e9'}; border-radius:8px; padding:16px; margin-bottom:16px; background:${a.isEmergency ? '#fff1f2' : '#fff'}; display:flex; justify-content:space-between; align-items:center; box-shadow:${a.isEmergency ? '0 0 0 3px rgba(239,68,68,0.18), 0 0 24px rgba(239,68,68,0.35)' : '0 1px 3px rgba(0,0,0,0.05)'}; animation:${a.isEmergency ? 'emergencyFlicker 1s infinite' : 'none'};">
                <div style="display:flex; flex-direction:column; gap:4px;">
                    ${a.isEmergency ? `
                        <div style="display:inline-flex; align-items:center; gap:6px; align-self:flex-start; background:#dc2626; color:white; padding:4px 10px; border-radius:999px; font-size:0.75rem; font-weight:800; margin-bottom:4px; letter-spacing:0;">
                            <i class="fa-solid fa-triangle-exclamation"></i> EMERGENCY SOS
                        </div>` : ''}
                    <h3 style="margin:0; font-size:1.05rem; color:#0f172a; font-weight:600;">
                        ${a.userName || a.clientName || 'Unknown User'}
                    </h3>
                    <div style="color:#64748b; font-size:0.875rem; display:flex; gap:12px;">
                        <span><i class="fa-regular fa-clock"></i> ${a.time}</span>
                        <span><i class="fa-solid fa-calendar-day"></i> ${a.date}</span>
                        <span style="color:#0ea5e9; font-weight:500;">
                            ${a.type === 'online'
                                ? '<i class="fa-solid fa-video"></i> Video Call'
                                : '<i class="fa-solid fa-location-dot"></i> In-Person'}
                        </span>
                    </div>
                    ${a.note ? `<p style="margin:4px 0 0; color:#475569; font-size:0.8rem; font-style:italic;">Note: ${a.note}</p>` : ''}
                </div>
                <div style="display:flex; align-items:center;">
                    ${actionHtml}
                </div>
            </div>`;
    }).join('');
}

// =========================================
// START SESSION & NOTIFY USER
// =========================================
async function startSessionAndNotify(appointmentId, userName, userId) {
    try {
        fetch(`${apiBaseUrl}/notifications/session-started`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ userId, appointmentId })
        }).catch(err => console.error('Notification failed:', err));

        const res = await fetch(`${apiBaseUrl}/appointments/${appointmentId}/join`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const data = await res.json();
        if (!res.ok) {
            alert(data.message);
            return;
        }

        const modalTitle = document.getElementById('video-modal-title');
        const iframe = document.getElementById('daily-iframe');
        const modal = document.getElementById('video-modal');
        const overlay = document.getElementById('video-modal-overlay');

        if (modalTitle) modalTitle.textContent = `Session with ${userName}`;
        if (iframe) iframe.src = data.url;
        if (modal) modal.classList.add('active');
        if (overlay) overlay.classList.add('active');

    } catch (error) {
        alert('Failed to start session. Please try again.');
        console.error('Start session error:', error);
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
// LOAD AVAILABILITY FROM DATABASE
// =========================================
const defaultAvailability = [
    { day: 'Monday', active: false, start: '09:00', end: '17:00' },
    { day: 'Tuesday', active: false, start: '09:00', end: '17:00' },
    { day: 'Wednesday', active: false, start: '09:00', end: '17:00' },
    { day: 'Thursday', active: false, start: '09:00', end: '17:00' },
    { day: 'Friday', active: false, start: '09:00', end: '17:00' },
    { day: 'Saturday', active: false, start: '09:00', end: '17:00' },
    { day: 'Sunday', active: false, start: '09:00', end: '17:00' }
];

let availability = [];

async function loadAvailability() {
    try {
        const res = await fetch(`${apiBaseUrl}/therapist/availability`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await res.json();
        
        // If the DB has a schedule, use it. Otherwise, use the default 7-day blank slate.
        if (data.schedule && data.schedule.length > 0) {
            availability = data.schedule;
        } else {
            // Deep copy the default so we don't accidentally mutate the original array
            availability = JSON.parse(JSON.stringify(defaultAvailability));
        }

        renderAvailability();
        updateNextAvailable(); 
    } catch (err) {
        console.error('Availability load error:', err);
    }
}

// =========================================
// CALCULATE NEXT AVAILABLE FROM SCHEDULE
// =========================================
function updateNextAvailable() {
    const el = document.getElementById('cal-next');
    if (!el) return;

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Search up to 7 days ahead
    for (let i = 0; i < 7; i++) {
        const checkDayIndex = (currentDay + i) % 7;
        const checkDayName = dayNames[checkDayIndex];
        const slot = availability.find(s => s.day === checkDayName && s.active && s.start);

        if (!slot) continue;

        const [startHour, startMinute] = slot.start.split(':').map(Number);
        const [endHour, endMinute] = slot.end.split(':').map(Number);

        // If today, check if the slot hasn't ended yet
        if (i === 0) {
            const slotEndMinutes = endHour * 60 + endMinute;
            const nowMinutes = currentHour * 60 + currentMinute;

            if (nowMinutes >= slotEndMinutes) continue; // slot already passed today

            // If we're before or within the slot
            const displayTime = nowMinutes < startHour * 60 + startMinute
                ? slot.start  // slot hasn't started yet today
                : formatTime(currentHour, currentMinute); // we're within the slot now

            el.textContent = i === 0 ? `Today ${formatTime12(slot.start)}` : `${checkDayName} ${formatTime12(slot.start)}`;
            return;
        }

        // Future day
        el.textContent = i === 1
            ? `Tomorrow ${formatTime12(slot.start)}`
            : `${checkDayName} ${formatTime12(slot.start)}`;
        return;
    }

    el.textContent = 'No availability set';
}

// =========================================
// TIME FORMAT HELPERS
// =========================================
function formatTime12(time24) {
    if (!time24) return '';
    const [hour, minute] = time24.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h = hour % 12 || 12;
    return `${h}:${minute.toString().padStart(2, '0')} ${ampm}`;
}
function formatTime(hour, minute) {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

// =========================================
// SAVE AVAILABILITY TO DATABASE
// =========================================
async function saveAvailability() {
    try {
        const res = await fetch(`${apiBaseUrl}/therapist/availability`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ schedule: availability })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        updateNextAvailable(); // ✅ refresh after saving
        alert('Availability saved successfully!');
    } catch (err) {
        alert('Failed to save: ' + err.message);
    }
}

// =========================================
// RENDER AVAILABILITY 
// (Restored! You accidentally deleted this block)
// =========================================
function renderAvailability() {
    const container = document.getElementById('availability-list-container');
    if (!container) return;

    container.innerHTML = availability.map((slot, i) => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #f1f5f9;">
            <div style="display:flex; align-items:center; gap:10px;">
                <input type="checkbox" id="day-${i}" ${slot.active ? 'checked' : ''}
                    onchange="toggleDay(${i})"
                    style="width:16px; height:16px; cursor:pointer;">
                <label for="day-${i}" style="font-weight:500; color:#0f172a; min-width:90px; cursor:pointer;">
                    ${slot.day}
                </label>
            </div>
            ${slot.active ? `
                <div style="display:flex; align-items:center; gap:6px; font-size:0.85rem; color:#64748b;">
                    <input type="time" value="${slot.start}" onchange="updateTime(${i}, 'start', this.value)"
                        style="border:1px solid #e2e8f0; border-radius:4px; padding:4px 6px; font-size:0.8rem;">
                    <span>to</span>
                    <input type="time" value="${slot.end}" onchange="updateTime(${i}, 'end', this.value)"
                        style="border:1px solid #e2e8f0; border-radius:4px; padding:4px 6px; font-size:0.8rem;">
                </div>` : `
                <span style="color:#94a3b8; font-size:0.8rem;">Unavailable</span>`}
        </div>`
    ).join('');
}

function toggleDay(index) {
    availability[index].active = !availability[index].active;
    renderAvailability();
    updateNextAvailable();
}

function updateTime(index, field, value) {
    availability[index][field] = value;
    updateNextAvailable();
}

// =========================================
// EDIT / SAVE AVAILABILITY BUTTON
// =========================================
document.getElementById('btn-edit-availability')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-edit-availability');
    const container = document.getElementById('availability-list-container');
    const isEditing = container.getAttribute('data-editing') === 'true';

    if (isEditing) {
        container.setAttribute('data-editing', 'false');
        btn.textContent = 'Edit Availability';
        await saveAvailability();
    } else {
        container.setAttribute('data-editing', 'true');
        btn.textContent = 'Save Availability';
    }
});

// =========================================
// UPDATE DASHBOARD STATS
// =========================================
function updateDashboardStats(approved, pending) {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const todayCount = approved.filter(a => a.date === todayStr).length;

    const weekCount = approved.filter(a => {
        const d = new Date(a.date);
        const diff = (d - now) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 7;
    }).length;

    const el = id => document.getElementById(id);
    if (el('cal-today')) el('cal-today').textContent = todayCount;
    if (el('cal-week')) el('cal-week').textContent = weekCount;
    if (el('cal-pending')) el('cal-pending').textContent = pending.length;
    if (el('overview-sessions-today')) el('overview-sessions-today').textContent = todayCount;
    // cal-next is handled by updateNextAvailable() from availability data
}

// =========================================
// INIT
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    loadTherapistAppointments();
    loadAvailability();
});
