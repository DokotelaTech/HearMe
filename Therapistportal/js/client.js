(function () {

const clientsContainer = document.getElementById('clients-list-container');
if (!clientsContainer) return;

let allAppointments = [];

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// =========================================
// FETCH ALL APPOINTMENTS
// =========================================
async function fetchClients() {
    clientsContainer.innerHTML = `
        <div style="text-align:center; padding:40px; color:#64748b;">
            <i class="fa-solid fa-spinner fa-spin" style="font-size:1.5rem; margin-bottom:12px; display:block;"></i>
            <p>Loading appointments...</p>
        </div>`;

    const response = await apiRequest('/appointments/therapist');
    if (!response) return;

    allAppointments = response.appointments || [];
    updateStats();
    renderClients('all');
}

// =========================================
// UPDATE STAT CARDS
// =========================================
function updateStats() {
    const total   = allAppointments.length;
    const active  = allAppointments.filter(a => a.status === 'approved').length;
    const pending = allAppointments.filter(a => a.status === 'pending').length;

    const el = id => document.getElementById(id);
    if (el('stat-total'))   el('stat-total').textContent   = total;
    if (el('stat-active'))  el('stat-active').textContent  = active;
    if (el('stat-pending')) el('stat-pending').textContent = pending;
    if (el('stat-newmsgs')) el('stat-newmsgs').textContent = 0;

    if (el('overview-active-clients')) el('overview-active-clients').textContent = active;
}

// =========================================
// FILTER BUTTONS
// =========================================
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderClients(btn.dataset.filter);
    });
});

// =========================================
// SEARCH
// =========================================
const searchInput = document.getElementById('client-search');
if (searchInput) {
    searchInput.addEventListener('input', () => {
        const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
        renderClients(activeFilter);
    });
}

// =========================================
// RENDER CLIENTS
// =========================================
function renderClients(filter = 'all') {
    const searchQuery = document.getElementById('client-search')?.value.toLowerCase() || '';

    let filtered = [...allAppointments];

    if (filter === 'pending')  filtered = filtered.filter(a => a.status === 'pending');
    if (filter === 'active')   filtered = filtered.filter(a => a.status === 'approved');
    if (filter === 'inactive') filtered = filtered.filter(a => a.status === 'denied' || a.status === 'cancelled');

    if (searchQuery) {
        filtered = filtered.filter(a =>
            (a.userName || a.clientName || '').toLowerCase().includes(searchQuery) ||
            (a.type || '').toLowerCase().includes(searchQuery) ||
            (a.note || '').toLowerCase().includes(searchQuery)
        );
    }

    const statusOrder = { pending: 0, approved: 1, denied: 2, cancelled: 3, pending_payment: 4 };

    if (filter === 'all') {
        filtered.sort((a, b) => {
            if (a.isEmergency !== b.isEmergency) return a.isEmergency ? -1 : 1;
            const statusDiff = (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99);
            if (statusDiff !== 0) return statusDiff;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    } else {
        filtered.sort((a, b) => {
            if (a.isEmergency !== b.isEmergency) return a.isEmergency ? -1 : 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }

    clientsContainer.innerHTML = '';

    if (filtered.length === 0) {
        clientsContainer.innerHTML = `
            <div style="text-align:center; padding:60px 20px; color:#94a3b8;">
                <i class="fa-solid fa-calendar-xmark" style="font-size:2.5rem; margin-bottom:16px; display:block;"></i>
                <h3 style="margin:0 0 8px; color:#64748b; font-size:1.1rem;">No appointments found</h3>
                <p style="margin:0; font-size:0.9rem;">Try adjusting your filter or search query</p>
            </div>`;
        return;
    }

    filtered.forEach(a => {
        const name     = a.userName || a.clientName || 'Unknown Client';
        const safeName = escapeHtml(name);
        const initial  = name.charAt(0).toUpperCase();

        // ── Status config ──────────────────────────────────────
        // "accepted_by_other" = emergency was claimed by another therapist
        const statusConfig = {
            pending:           { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', label: 'Pending',             icon: 'fa-clock' },
            approved:          { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: 'Approved',            icon: 'fa-circle-check' },
            denied:            { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'Declined',            icon: 'fa-circle-xmark' },
            cancelled:         { color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb', label: 'Cancelled',           icon: 'fa-ban' },
            pending_payment:   { color: '#7c3aed', bg: '#faf5ff', border: '#e9d5ff', label: 'Awaiting Payment',    icon: 'fa-credit-card' },
            accepted_by_other: { color: '#64748b', bg: '#f1f5f9', border: '#cbd5e1', label: 'Accepted by Other',  icon: 'fa-user-check' }
        };

        const s = statusConfig[a.status] || statusConfig.pending;

        const avatarColors = ['#7c3aed', '#0ea5e9', '#16a34a', '#f59e0b', '#e11d48'];
        const avatarColor  = avatarColors[name.charCodeAt(0) % avatarColors.length];

        const sessionDate   = new Date(`${a.date}T${a.time}`);
        const formattedDate = sessionDate.toLocaleDateString('en-ZA', {
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
        });
        const formattedTime = sessionDate.toLocaleTimeString('en-ZA', {
            hour: '2-digit', minute: '2-digit', hour12: true
        });

        // ── Card style ─────────────────────────────────────────
        // Emergency + pending  → red glowing pulse
        // Emergency + accepted_by_other → plain, no glow, no buttons
        // Emergency + approved → no glow (this therapist accepted it)
        const isActiveEmergency = a.isEmergency && a.status === 'pending';

        const emergencyStyle = isActiveEmergency
            ? 'border:2px solid #ef4444; background:#fff1f2; box-shadow:0 0 0 3px rgba(239,68,68,0.18), 0 0 24px rgba(239,68,68,0.35); animation:emergencyFlicker 1s infinite;'
            : a.isEmergency && a.status === 'accepted_by_other'
                ? 'background:#f8fafc; border:1.5px solid #cbd5e1; box-shadow:none; opacity:0.75;'
                : a.isEmergency
                    ? 'background:#fff1f2; border:1.5px solid #fecaca; box-shadow:none;'
                    : 'background:white; border:1px solid #e2e8f0; box-shadow:0 1px 3px rgba(0,0,0,0.05);';

        // ── Action buttons ─────────────────────────────────────
        // Only show for pending (including emergency pending)
        // Hide entirely when accepted_by_other
        const actionButtons = a.status === 'pending' ? `
            <div style="display:flex; gap:10px; margin-top:16px; padding-top:16px; border-top:1px solid #f1f5f9;">
                <button onclick="updateStatus('${a._id}', 'approved')"
                    style="flex:1; background:${a.isEmergency ? '#dc2626' : '#16a34a'}; color:white; border:none; padding:10px 16px; border-radius:8px; cursor:pointer; font-weight:700; font-size:0.875rem; display:flex; align-items:center; justify-content:center; gap:8px;">
                    <i class="fa-solid ${a.isEmergency ? 'fa-phone-volume' : 'fa-check'}"></i>
                    ${a.isEmergency ? 'Accept & Start Emergency Call' : 'Accept Session'}
                </button>
                <button onclick="updateStatus('${a._id}', 'denied')"
                    style="flex:1; background:white; color:#dc2626; border:1.5px solid #fecaca; padding:10px 16px; border-radius:8px; cursor:pointer; font-weight:600; font-size:0.875rem; display:flex; align-items:center; justify-content:center; gap:8px;"
                    onmouseover="this.style.background='#fef2f2'" onmouseout="this.style.background='white'">
                    <i class="fa-solid fa-xmark"></i> Decline
                </button>
            </div>` : '';

        clientsContainer.innerHTML += `
            <div id="appt-${a._id}"
                style="${emergencyStyle} border-radius:12px; padding:20px; margin-bottom:16px; transition:box-shadow 0.2s, opacity 0.3s;">

                <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:16px;">
                    <div style="display:flex; align-items:flex-start; gap:14px; flex:1;">
                        <div style="width:48px; height:48px; border-radius:12px; background:${avatarColor}; color:white; font-weight:700; font-size:1.2rem; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                            ${initial}
                        </div>
                        <div style="flex:1;">
                            ${a.isEmergency ? `
                                <div style="display:inline-flex; align-items:center; gap:6px; background:#dc2626; color:white; padding:4px 10px; border-radius:999px; font-size:0.75rem; font-weight:800; margin-bottom:8px;">
                                    <i class="fa-solid fa-triangle-exclamation"></i> EMERGENCY SOS
                                </div>` : ''}
                            <h3 style="margin:0 0 4px; font-size:1rem; color:#0f172a; font-weight:600;">${safeName}</h3>
                            <div style="display:flex; flex-wrap:wrap; gap:12px; color:#64748b; font-size:0.825rem; margin-bottom:6px;">
                                <span><i class="fa-regular fa-calendar" style="margin-right:4px;"></i>${formattedDate}</span>
                                <span><i class="fa-regular fa-clock" style="margin-right:4px;"></i>${formattedTime}</span>
                                <span>
                                    <i class="fa-solid ${a.type === 'online' ? 'fa-video' : 'fa-location-dot'}" style="margin-right:4px; color:#0ea5e9;"></i>
                                    ${a.type === 'online' ? 'Online Session' : 'In-Person'}
                                </span>
                            </div>
                            ${a.note ? `
                                <div style="background:#f8fafc; border-left:3px solid #cbd5e1; padding:8px 12px; border-radius:0 6px 6px 0; font-size:0.825rem; color:#475569; font-style:italic;">
                                    "${escapeHtml(a.note)}"
                                </div>` : ''}
                        </div>
                    </div>

                    <div style="background:${s.bg}; border:1px solid ${s.border}; color:${s.color}; padding:5px 12px; border-radius:20px; font-size:0.775rem; font-weight:600; display:flex; align-items:center; gap:6px; white-space:nowrap; flex-shrink:0;">
                        <i class="fa-solid ${s.icon}"></i>
                        ${s.label}
                    </div>
                </div>

                ${actionButtons}
            </div>`;
    });
}

// =========================================
// UPDATE APPOINTMENT STATUS
// =========================================
async function updateStatus(appointmentId, status) {
    const card    = document.getElementById(`appt-${appointmentId}`);
    const buttons = card?.querySelectorAll('button');
    if (buttons) buttons.forEach(b => b.disabled = true);

    const response = await apiRequest(
        `/appointments/${appointmentId}/status`,
        'PATCH',
        { status }
    );

    if (!response) {
        if (buttons) buttons.forEach(b => b.disabled = false);
        return;
    }

    // Update local state
    const appt = allAppointments.find(a => a._id === appointmentId);
    if (appt) Object.assign(appt, response.appointment || { status });

    updateStats();

    // ── If a therapist accepted an emergency → start call + send emails ──
    if (status === 'approved' && (response.appointment?.isEmergency || appt?.isEmergency)) {
        // Mark every OTHER emergency pending card as "accepted_by_other"
        // so the glow stops and buttons disappear for this therapist's view
        allAppointments.forEach(a => {
            if (a._id !== appointmentId && a.isEmergency && a.status === 'pending') {
                a.status = 'accepted_by_other';
            }
        });

        await startEmergencyCall(appointmentId, appt?.clientName || appt?.userName || 'Client', appt?.userId);
        fetchClients(); // re-fetch fresh state from server
        return;
    }

    // Animate out then re-render
    if (card) {
        card.style.transition = 'opacity 0.3s, transform 0.3s';
        card.style.opacity    = '0';
        card.style.transform  = 'translateX(20px)';
        setTimeout(() => {
            const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
            renderClients(activeFilter);
        }, 300);
    }
}

// =========================================
// START EMERGENCY CALL + SEND BREVO EMAILS
// =========================================
async function startEmergencyCall(appointmentId, clientName, userId) {
    try {
        // ── Fire Brevo emails (client + therapist confirmation) ──
        if (userId) {
            fetch('/api/emergency/session-started', {
                method:  'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type':  'application/json'
                },
                body: JSON.stringify({ clientId: userId })
            }).catch(err => console.error('Email notification failed:', err));
        }

        // ── Join the Daily.co video call ─────────────────────────
        const res  = await fetch(`/api/appointments/${appointmentId}/join`, {
            method:  'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to start emergency call');

        const title   = document.getElementById('video-modal-title');
        const iframe  = document.getElementById('daily-iframe');
        const modal   = document.getElementById('video-modal');
        const overlay = document.getElementById('video-modal-overlay');

        if (title)   title.textContent = `Emergency SOS with ${clientName}`;
        if (iframe)  iframe.src = data.url;
        if (modal)   modal.classList.add('active');
        if (overlay) overlay.classList.add('active');

    } catch (error) {
        alert(error.message || 'Emergency accepted, but the call could not start.');
    }
}

// =========================================
// CLOSE VIDEO MODAL
// =========================================
document.getElementById('close-video-modal')?.addEventListener('click', () => {
    const iframe = document.getElementById('daily-iframe');
    if (iframe) iframe.src = '';
    document.getElementById('video-modal')?.classList.remove('active');
    document.getElementById('video-modal-overlay')?.classList.remove('active');
});

// =========================================
// EXPOSE GLOBALS & INIT
// =========================================
window.updateStatus = updateStatus;
fetchClients();

})();