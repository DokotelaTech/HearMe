<<<<<<< HEAD
<<<<<<< HEAD
const apiBaseUrl = 'http://localhost:5000/api';
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
// RENDER CONFIRMED SESSIONS
// =========================================
function renderSchedule(appointmentsList) {
    appointmentsContainer.innerHTML = '';

    if (appointmentsList.length === 0) {
        appointmentsContainer.innerHTML = `
            <div style="padding:30px; text-align:center; color:#64748b; background:#f8fafc; border-radius:8px; border:1px dashed #cbd5e1;">
                No confirmed sessions scheduled.
            </div>`;
        return;
    }

    appointmentsContainer.innerHTML = appointmentsList.map(a => {
        const sessionDateTime = new Date(`${a.date}T${a.time}`);
        const now = new Date();
        const diffMinutes = (sessionDateTime - now) / (1000 * 60);

        let actionHtml = '';

        if (a.type === 'online' && diffMinutes <= 10 && diffMinutes >= -60) {
            actionHtml = `
                <button onclick="startSessionAndNotify('${a._id}', '${a.userName || a.clientName}', '${a.userId}')"
                    style="background:#0ea5e9; color:white; border:none; padding:10px 18px; border-radius:6px; cursor:pointer; font-weight:600; display:flex; align-items:center; gap:8px;">
                    <i class="fa-solid fa-video"></i> Start Call
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
            <div id="appointment-${a._id}" style="border:1px solid #e2e8f0; border-left:4px solid #0ea5e9; border-radius:8px; padding:16px; margin-bottom:16px; background:#fff; display:flex; justify-content:space-between; align-items:center; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                <div style="display:flex; flex-direction:column; gap:4px;">
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
        // Notify user — non-blocking
        fetch(`${apiBaseUrl}/notifications/session-started`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ userId, appointmentId })
        }).catch(err => console.error('Notification failed:', err));

        // Create/get Daily.co room
        const res = await fetch(`${apiBaseUrl}/appointments/${appointmentId}/join`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const data = await res.json();
        if (!res.ok) {
            alert(data.message);
            return;
        }

        // Open video modal
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
let availability = [];

async function loadAvailability() {
    try {
        const res = await fetch(`${apiBaseUrl}/therapist/availability`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await res.json();
        availability = data.schedule || [];
        renderAvailability();
    } catch (err) {
        console.error('Availability load error:', err);
    }
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

        alert('Availability saved successfully!');
    } catch (err) {
        alert('Failed to save: ' + err.message);
    }
}

// =========================================
// RENDER AVAILABILITY
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
}

function updateTime(index, field, value) {
    availability[index][field] = value;
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

    const future = approved
        .map(a => new Date(`${a.date}T${a.time}`))
        .filter(d => d > now)
        .sort((a, b) => a - b);

    const nextStr = future.length > 0
        ? future[0].toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
        : '--:-- PM';

    const el = id => document.getElementById(id);
    if (el('cal-today')) el('cal-today').textContent = todayCount;
    if (el('cal-week')) el('cal-week').textContent = weekCount;
    if (el('cal-next')) el('cal-next').textContent = nextStr;
    if (el('cal-pending')) el('cal-pending').textContent = pending.length;
    if (el('overview-sessions-today')) el('overview-sessions-today').textContent = todayCount;
}

// =========================================
// INIT
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    loadTherapistAppointments();
    loadAvailability();
});
=======
const appointmentsContainer =
    document.getElementById(
        "appointments-list-container"
    );
=======
const apiBaseUrl = 'http://localhost:5000/api';
const authToken = localStorage.getItem('token');
const appointmentsContainer = document.getElementById('appointments-list-container');
>>>>>>> ce02a37 (new features)

// Redirect if not logged in
if (!authToken) {
    window.location.href = '/login';
}

// =========================================
// LOAD & FILTER APPOINTMENTS
// =========================================
async function loadTherapistAppointments() {
    if (!appointmentsContainer) return;

    try {
        const response = await fetch(`${apiBaseUrl}/appointments/therapist`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!response.ok) throw new Error('Failed to fetch appointments');

        const data = await response.json();
        const allAppointments = data.appointments || [];
        
        // Filter for only approved/confirmed sessions
        const approvedAppointments = allAppointments.filter(app => app.status === 'approved' || app.status === 'confirmed');

        updateDashboardStats(approvedAppointments);
        renderSchedule(approvedAppointments);

    } catch (error) {
        console.error('Appointments load error:', error);
        appointmentsContainer.innerHTML = '<p class="muted text-sm" style="text-align: center;">Could not load schedule.</p>';
    }
}

// =========================================
// RENDER SCHEDULE WITH CLEAN UI
// =========================================
function renderSchedule(appointmentsList) {
    appointmentsContainer.innerHTML = '';

    if (appointmentsList.length === 0) {
        appointmentsContainer.innerHTML = `
            <div style="padding: 30px; text-align: center; color: #64748b; background: #f8fafc; border-radius: 8px; border: 1px dashed #cbd5e1;">
                No confirmed appointments scheduled for today.
            </div>
        `;
        return;
    }

    appointmentsContainer.innerHTML = appointmentsList.map(appointment => {
        const sessionDateTime = new Date(`${appointment.date}T${appointment.time}`);
        const currentTime = new Date();
        const timeDifferenceMinutes = (sessionDateTime - currentTime) / (1000 * 60);
        
        let actionAreaHtml = '';
        
        // Show button if online and within 10 minutes of start time
        if (appointment.type === 'online' && timeDifferenceMinutes <= 10 && timeDifferenceMinutes >= -60) {
            actionAreaHtml = `
                <button onclick="startSessionAndNotify('${appointment._id}', '${appointment.clientName}', '${appointment.userId}')" 
                        style="background: #0ea5e9; color: white; border: none; padding: 10px 18px; border-radius: 6px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px; transition: background 0.2s;">
                    <i class="fa-solid fa-video"></i> Start Session
                </button>
            `;
        } else if (appointment.type === 'online' && timeDifferenceMinutes > 10) {
            actionAreaHtml = `<span style="color: #64748b; font-size: 0.85rem;">Starts in ${Math.round(timeDifferenceMinutes)} min</span>`;
        } else {
            actionAreaHtml = `<span style="background: #f1f5f9; padding: 6px 12px; border-radius: 4px; color: #475569; font-size: 0.85rem;">In-Person</span>`;
        }

        // Clean Card UI
        return `
            <div id="appointment-${appointment._id}" style="border: 1px solid #e2e8f0; border-left: 4px solid #0ea5e9; border-radius: 8px; padding: 16px; margin-bottom: 16px; background: #ffffff; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <h3 style="margin: 0; font-size: 1.1rem; color: #0f172a; font-weight: 600;">
                        ${appointment.clientName || 'Unknown Client'}
                    </h3>
                    <div style="color: #64748b; font-size: 0.9rem; display: flex; align-items: center; gap: 12px;">
                        <span><i class="fa-regular fa-clock"></i> ${appointment.time}</span>
                        <span><i class="fa-solid fa-calendar-day"></i> ${appointment.date}</span>
                        <span style="color: #0ea5e9; font-weight: 500;"><i class="fa-solid fa-video"></i> Video Call</span>
                    </div>
                    ${appointment.note ? `<p style="margin: 4px 0 0 0; color: #475569; font-size: 0.85rem; font-style: italic;">Note: ${appointment.note}</p>` : ''}
                </div>

                <div style="display: flex; align-items: center;">
                    ${actionAreaHtml}
                </div>

            </div>
        `;
    }).join('');
}

// =========================================
// START SESSION & NOTIFY USER VIA ONESIGNAL
// =========================================
async function startSessionAndNotify(appointmentId, clientName, clientId) {
    try {
        // 1. Trigger backend to send OneSignal SMS to the user
        // Note: Always handle 3rd party API keys securely on your Express backend, not the frontend.
        fetch(`${apiBaseUrl}/notifications/notify-session-start`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}` 
            },
            body: JSON.stringify({ userId: clientId, appointmentId: appointmentId })
        }).catch(err => console.error("Notification failed:", err)); // Non-blocking

<<<<<<< HEAD
fetchAppointments();
>>>>>>> 98ea0a3 (sprint 2)
=======
        // 2. Join the Daily.co room
        const response = await fetch(`${apiBaseUrl}/appointments/${appointmentId}/join`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message);
            return;
        }

        // 3. Open Video Modal
        const modalTitle = document.getElementById('video-modal-title');
        const iframeElement = document.getElementById('daily-iframe');
        const videoModal = document.getElementById('video-modal');
        const modalOverlay = document.getElementById('video-modal-overlay');

        if (modalTitle) modalTitle.textContent = `Session with ${clientName}`;
        if (iframeElement) iframeElement.src = data.url;
        
        if (videoModal) videoModal.classList.add('active');
        if (modalOverlay) modalOverlay.classList.add('active');

    } catch (error) {
        alert('Failed to start session. Please try again.');
        console.error('Join session error:', error);
    }
}

// =========================================
// UPDATE DASHBOARD STATS
// =========================================
function updateDashboardStats(approvedAppointments) {
    const currentDate = new Date();
    const todayDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    
    const nextWeekDate = new Date(todayDateOnly);
    nextWeekDate.setDate(todayDateOnly.getDate() + 7);

    let todayCount = 0;
    let weekCount = 0;
    let nextAvailableStr = '--:-- PM';

    const futureAppointments = [];

    approvedAppointments.forEach(appointment => {
        const [year, month, day] = appointment.date.split('-');
        const appointmentDate = new Date(year, month - 1, day);
        
        if (appointmentDate.getTime() === todayDateOnly.getTime()) todayCount++;
        if (appointmentDate >= todayDateOnly && appointmentDate <= nextWeekDate) weekCount++;

        const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
        if (appointmentDateTime > currentDate) {
            futureAppointments.push(appointmentDateTime);
        }
    });

    if (futureAppointments.length > 0) {
        futureAppointments.sort((a, b) => a - b);
        nextAvailableStr = futureAppointments[0].toLocaleTimeString('en-US', { 
            hour: '2-digit', minute: '2-digit', hour12: true 
        });
    }

    const statTodayElement = document.getElementById('cal-today');
    const statWeekElement = document.getElementById('cal-week');
    const statNextElement = document.getElementById('cal-next');

    if (statTodayElement) statTodayElement.textContent = todayCount;
    if (statWeekElement) statWeekElement.textContent = weekCount;
    if (statNextElement) statNextElement.textContent = nextAvailableStr;
}

// =========================================
// INITIALIZATION
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    loadTherapistAppointments();
});
>>>>>>> ce02a37 (new features)
