const apiBaseUrl = 'http://localhost:5000/api';
const authToken = localStorage.getItem('token');
const appointmentsContainer = document.getElementById('appointments-list-container');

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