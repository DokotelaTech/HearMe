/**
 * Call Session Management
 * Handles session state, join/end call functionality, and UI updates
 */

const SESSION_STORAGE_KEY = 'hearme_sessions';
const API_BASE = '/api';

function token() {
    return localStorage.getItem('token');
}

/* =========================================
   LOAD SESSION STATES FROM BACKEND
========================================= */
async function loadSessionStates() {
    try {
        const response = await fetch(`${API_BASE}/session/appointments`, {
            headers: {
                'Authorization': `Bearer ${token()}`
            }
        });

        if (!response.ok) throw new Error('Failed to load sessions');

        const data = await response.json();
        return data.appointments || [];
    } catch (error) {
        console.error('Error loading sessions:', error);
        return [];
    }
}

/* =========================================
   END CALL SESSION
========================================= */
async function endCallSession(appointmentId) {
    try {
        const response = await fetch(`${API_BASE}/session/appointments/${appointmentId}/end`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token()}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Failed to end session');

        const data = await response.json();
        
        // Update button state in UI
        updateSessionButtonState(appointmentId, true);
        
        return data;
    } catch (error) {
        console.error('Error ending session:', error);
        alert('Failed to end session. Please try again.');
    }
}

/* =========================================
   CHECK IF USER CAN JOIN SESSION
========================================= */
async function canJoinSession(appointmentId) {
    try {
        const response = await fetch(`${API_BASE}/session/appointments/${appointmentId}/can-join`, {
            headers: {
                'Authorization': `Bearer ${token()}`
            }
        });

        if (!response.ok) throw new Error('Cannot check session');

        const data = await response.json();
        return data.canJoin;
    } catch (error) {
        console.error('Error checking session:', error);
        return false;
    }
}

/* =========================================
   UPDATE SESSION BUTTON STATE
========================================= */
function updateSessionButtonState(appointmentId, isEnded = false) {
    const btn = document.querySelector(`[data-session-id="${appointmentId}"]`);
    
    if (!btn) return;

    if (isEnded) {
        btn.disabled = true;
        btn.textContent = '✓ Ended';
        btn.classList.add('btn-ended');
        btn.classList.remove('btn-join-call');
    } else {
        btn.disabled = false;
        btn.textContent = 'Join Call';
        btn.classList.add('btn-join-call');
        btn.classList.remove('btn-ended');
    }
}

/* =========================================
   RENDER UPCOMING SESSIONS
========================================= */
async function renderUpcomingSessions() {
    const container = document.getElementById('dynamic-events');
    if (!container) return;

    try {
        const appointments = await loadSessionStates();

        if (!appointments.length) {
            container.innerHTML = '<p class="empty-state">No upcoming sessions</p>';
            return;
        }

        const upcomingSessions = appointments.filter(apt => !apt.isEnded);

        if (!upcomingSessions.length) {
            container.innerHTML = '<p class="empty-state">No upcoming sessions</p>';
            return;
        }

        container.innerHTML = upcomingSessions.map(apt => {
            const appointmentDate = new Date(apt.date);
            const dateString = appointmentDate.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            return `
                <div class="session-item">
                    <div class="session-info">
                        <div class="session-title">${apt.therapistName || 'Therapist'}</div>
                        <div class="session-time">
                            <i data-lucide="clock"></i>
                            ${dateString}
                        </div>
                        <div class="session-status" id="status-${apt.id}">
                            ${apt.isEnded ? '<span class="status-ended">✓ Session Ended</span>' : '<span class="status-active">● Active</span>'}
                        </div>
                    </div>
                    <div class="session-actions">
                        ${apt.isEnded 
                            ? `<button class="btn-session-ended" disabled>✓ Ended</button>`
                            : `<button class="btn-join-call" data-session-id="${apt.id}" onclick="handleJoinCall('${apt.id}')">
                                <i data-lucide="video"></i> Join Call
                            </button>
                            <button class="btn-end-call" onclick="handleEndCall('${apt.id}')">
                                <i data-lucide="x"></i> End
                            </button>`
                        }
                    </div>
                </div>
            `;
        }).join('');

        lucide.createIcons();
    } catch (error) {
        container.innerHTML = `<p class="empty-state error">Error loading sessions</p>`;
    }
}

/* =========================================
   HANDLE JOIN CALL CLICK
========================================= */
async function handleJoinCall(appointmentId) {
    const canJoin = await canJoinSession(appointmentId);

    if (!canJoin) {
        alert('This session has already ended or is unavailable.');
        return;
    }

    // Open video modal
    const modal = document.getElementById('video-modal');
    const overlay = document.getElementById('video-modal-overlay');

    if (modal && overlay) {
        modal.style.display = 'flex';
        overlay.style.display = 'block';

        // Store current session ID for ending
        modal.dataset.appointmentId = appointmentId;
    }
}

/* =========================================
   HANDLE END CALL CLICK
========================================= */
async function handleEndCall(appointmentId) {
    if (confirm('Are you sure you want to end this session?')) {
        await endCallSession(appointmentId);
        await renderUpcomingSessions();
    }
}

/* =========================================
   INITIALIZE ON LOAD
========================================= */
document.addEventListener('DOMContentLoaded', () => {
    renderUpcomingSessions();

    // Close video modal
    const closeBtn = document.getElementById('close-video-modal');
    const modal = document.getElementById('video-modal');
    const overlay = document.getElementById('video-modal-overlay');

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (modal && overlay) {
                const appointmentId = modal.dataset.appointmentId;
                
                // End the call
                if (appointmentId) {
                    handleEndCall(appointmentId);
                }

                modal.style.display = 'none';
                overlay.style.display = 'none';
            }
        });
    }

    if (overlay) {
        overlay.addEventListener('click', () => {
            if (modal) modal.style.display = 'none';
            overlay.style.display = 'none';
        });
    }
});
