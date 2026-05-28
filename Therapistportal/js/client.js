(function () {

const clientsContainer = document.getElementById('clients-list-container');
if (!clientsContainer) return;

let allAppointments = [];

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

    // Update sidebar overview
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

    // Apply status filter
    if (filter === 'pending')  filtered = filtered.filter(a => a.status === 'pending');
    if (filter === 'active')   filtered = filtered.filter(a => a.status === 'approved');
    if (filter === 'inactive') filtered = filtered.filter(a => a.status === 'denied' || a.status === 'cancelled');

    // Apply search
    if (searchQuery) {
        filtered = filtered.filter(a =>
            (a.userName || a.clientName || '').toLowerCase().includes(searchQuery) ||
            (a.type || '').toLowerCase().includes(searchQuery) ||
            (a.note || '').toLowerCase().includes(searchQuery)
        );
    }

    // Sort
    const statusOrder = { pending: 0, approved: 1, denied: 2, cancelled: 3, pending_payment: 4 };

    if (filter === 'all') {
        // Group by status first, then newest first within each group
        filtered.sort((a, b) => {
            const statusDiff = (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99);
            if (statusDiff !== 0) return statusDiff;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    } else {
        // Just newest first within filter
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
        const name = a.userName || a.clientName || 'Unknown Client';
        const initial = name.charAt(0).toUpperCase();

        const statusConfig = {
            pending:         { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', label: 'Pending',         icon: 'fa-clock' },
            approved:        { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: 'Approved',        icon: 'fa-circle-check' },
            denied:          { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'Declined',        icon: 'fa-circle-xmark' },
            cancelled:       { color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb', label: 'Cancelled',       icon: 'fa-ban' },
            pending_payment: { color: '#7c3aed', bg: '#faf5ff', border: '#e9d5ff', label: 'Awaiting Payment', icon: 'fa-credit-card' }
        };

        const s = statusConfig[a.status] || statusConfig.pending;
        const avatarColors = ['#7c3aed', '#0ea5e9', '#16a34a', '#f59e0b', '#e11d48'];
        const avatarColor = avatarColors[name.charCodeAt(0) % avatarColors.length];

        const sessionDate = new Date(`${a.date}T${a.time}`);
        const formattedDate = sessionDate.toLocaleDateString('en-ZA', {
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
        });
        const formattedTime = sessionDate.toLocaleTimeString('en-ZA', {
            hour: '2-digit', minute: '2-digit', hour12: true
        });

        const actionButtons = a.status === 'pending' ? `
            <div style="display:flex; gap:10px; margin-top:16px; padding-top:16px; border-top:1px solid #f1f5f9;">
                <button onclick="updateStatus('${a._id}', 'approved')"
                    style="flex:1; background:#16a34a; color:white; border:none; padding:10px 16px; border-radius:8px; cursor:pointer; font-weight:600; font-size:0.875rem; display:flex; align-items:center; justify-content:center; gap:8px;"
                    onmouseover="this.style.background='#15803d'" onmouseout="this.style.background='#16a34a'">
                    <i class="fa-solid fa-check"></i> Accept Session
                </button>
                <button onclick="updateStatus('${a._id}', 'denied')"
                    style="flex:1; background:white; color:#dc2626; border:1.5px solid #fecaca; padding:10px 16px; border-radius:8px; cursor:pointer; font-weight:600; font-size:0.875rem; display:flex; align-items:center; justify-content:center; gap:8px;"
                    onmouseover="this.style.background='#fef2f2'" onmouseout="this.style.background='white'">
                    <i class="fa-solid fa-xmark"></i> Decline
                </button>
            </div>` : '';

        clientsContainer.innerHTML += `
            <div id="appt-${a._id}"
                style="background:white; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin-bottom:16px; box-shadow:0 1px 3px rgba(0,0,0,0.05); transition:box-shadow 0.2s;"
                onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)'"
                onmouseout="this.style.boxShadow='0 1px 3px rgba(0,0,0,0.05)'">

                <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:16px;">
                    <div style="display:flex; align-items:flex-start; gap:14px; flex:1;">
                        <div style="width:48px; height:48px; border-radius:12px; background:${avatarColor}; color:white; font-weight:700; font-size:1.2rem; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                            ${initial}
                        </div>
                        <div style="flex:1;">
                            <h3 style="margin:0 0 4px; font-size:1rem; color:#0f172a; font-weight:600;">${name}</h3>
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
                                    "${a.note}"
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
    const card = document.getElementById(`appt-${appointmentId}`);
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
    if (appt) appt.status = status;

    updateStats();

    // Animate out then re-render
    if (card) {
        card.style.transition = 'opacity 0.3s, transform 0.3s';
        card.style.opacity = '0';
        card.style.transform = 'translateX(20px)';
        setTimeout(() => {
            const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
            renderClients(activeFilter);
        }, 300);
    }
}

window.updateStatus = updateStatus;
fetchClients();

})();