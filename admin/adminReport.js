// =========================================
// ADMIN REPORTS — admin-reports.js
// =========================================

const REPORTS_API = '/api';

const statusConfig = {
    pending:  { text: 'Pending',  bg: '#fef3c7', color: '#d97706' },
    reviewed: { text: 'Reviewed', bg: '#e0f2fe', color: '#0284c7' },
    resolved: { text: 'Resolved', bg: '#dcfce7', color: '#16a34a' }
};

const categoryConfig = {
    technical: { label: 'Technical Issue', icon: 'fa-wrench',        color: '#3b82f6', bg: '#eff6ff' },
    client:    { label: 'Client Concern',  icon: 'fa-user',          color: '#8b5cf6', bg: '#f5f3ff' },
    safety:    { label: 'Safety / Crisis', icon: 'fa-shield-halved', color: '#ef4444', bg: '#fef2f2' }
};

let allReports = [];
let activeFilter = 'all';

// =========================================
// LOAD ALL REPORTS
// =========================================
async function loadAllReports() {
    const tbody = document.getElementById('reports-table-body');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="5" class="empty-state">Loading reports...</td></tr>`;

    try {
        const res = await fetch(`${REPORTS_API}/reports/all`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        allReports = data.reports || [];

        // Update sidebar badge
        const pending = allReports.filter(r => r.status === 'pending').length;
        const badge = document.getElementById('sidebar-reports-badge');
        if (badge) {
            badge.textContent = pending;
            badge.style.display = pending > 0 ? 'inline-flex' : 'none';
        }

        // Update flagged content metric on dashboard
        const flaggedEl = document.getElementById('metric-flagged-content');
        if (flaggedEl) flaggedEl.textContent = allReports.length;

        renderReportsTable();

    } catch (err) {
        console.error('Load reports error:', err);
        tbody.innerHTML = `<tr><td colspan="5" class="empty-state">Failed to load reports.</td></tr>`;
    }
}

// =========================================
// FILTER
// =========================================
function setReportFilter(filter) {
    activeFilter = filter;

    document.querySelectorAll('.report-filter-tab').forEach(tab => {
        tab.classList.toggle('active', tab.getAttribute('data-filter') === filter);
    });

    renderReportsTable();
}

// =========================================
// RENDER TABLE
// =========================================
function renderReportsTable() {
    const tbody = document.getElementById('reports-table-body');
    if (!tbody) return;

    const filtered = activeFilter === 'all'
        ? allReports
        : allReports.filter(r => r.status === activeFilter);

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="empty-state">No ${activeFilter === 'all' ? '' : activeFilter} reports found.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(r => {
        const cat  = categoryConfig[r.category]  || categoryConfig.technical;
        const stat = statusConfig[r.status] || statusConfig.pending;
        const date = new Date(r.createdAt).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });

        return `
            <tr id="report-row-${r._id}">
                <td>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div style="background:${cat.bg}; width:34px; height:34px; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                            <i class="fa-solid ${cat.icon}" style="color:${cat.color}; font-size:13px;"></i>
                        </div>
                        <div>
                            <p style="margin:0; font-weight:600; font-size:13px;">${cat.label}</p>
                            <p style="margin:0; font-size:11px; color:#94a3b8;">${date}</p>
                        </div>
                    </div>
                </td>
                <td style="max-width:260px;">
                    <p style="margin:0; font-size:13px; color:#334155; line-height:1.5;
                        overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">
                        ${r.description}
                    </p>
                    ${r.adminNote ? `
                        <div style="margin-top:6px; background:#eff6ff; border-left:3px solid #3b82f6; padding:6px 10px; border-radius:4px;">
                            <p style="margin:0; font-size:11px; color:#1d4ed8; font-weight:600;">Admin Response:</p>
                            <p style="margin:2px 0 0 0; font-size:12px; color:#1e40af;">${r.adminNote}</p>
                        </div>` : ''}
                </td>
                <td>
                    <p style="margin:0; font-weight:600; font-size:13px; color:#0f172a;">${r.therapistName}</p>
                    <p style="margin:0; font-size:11px; color:#94a3b8;">Therapist</p>
                </td>
                <td style="font-size:13px; color:#64748b; white-space:nowrap;">${date}</td>
                <td>
                    <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
                        <span style="background:${stat.bg}; color:${stat.color}; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; white-space:nowrap;">
                            ${stat.text}
                        </span>
                        <button onclick="openReportDetail('${r._id}')"
                            style="background:#f1f5f9; color:#475569; border:none; padding:5px 10px; border-radius:6px; font-size:11px; font-weight:600; cursor:pointer; white-space:nowrap;">
                            <i class="fa-solid fa-eye"></i> View
                        </button>
                        ${r.status !== 'resolved' ? `
                        <button onclick="quickUpdateStatus('${r._id}', 'resolved')"
                            style="background:#dcfce7; color:#16a34a; border:none; padding:5px 10px; border-radius:6px; font-size:11px; font-weight:600; cursor:pointer; white-space:nowrap;">
                            Resolve
                        </button>` : ''}
                    </div>
                </td>
            </tr>`;
    }).join('');
}

// =========================================
// VIEW REPORT DETAIL MODAL
// =========================================
function openReportDetail(reportId) {
    const r = allReports.find(r => r._id === reportId);
    if (!r) return;

    const cat  = categoryConfig[r.category]  || categoryConfig.technical;
    const stat = statusConfig[r.status] || statusConfig.pending;
    const date = new Date(r.createdAt).toLocaleString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    const existing = document.getElementById('report-detail-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'report-detail-modal';
    modal.style.cssText = `
        position:fixed; inset:0; background:rgba(0,0,0,0.55);
        display:flex; align-items:center; justify-content:center;
        z-index:9999; padding:20px;
    `;

    modal.innerHTML = `
        <div style="background:white; border-radius:14px; width:100%; max-width:560px; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,0.2);">

            <div style="background:#0f172a; padding:20px 24px; display:flex; align-items:center; justify-content:space-between;">
                <div style="display:flex; align-items:center; gap:12px;">
                    <div style="background:${cat.bg}; width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center;">
                        <i class="fa-solid ${cat.icon}" style="color:${cat.color}; font-size:16px;"></i>
                    </div>
                    <div>
                        <h3 style="margin:0; color:white; font-size:16px;">${cat.label}</h3>
                        <p style="margin:0; color:#94a3b8; font-size:12px;">${date}</p>
                    </div>
                </div>
                <button onclick="document.getElementById('report-detail-modal').remove()"
                    style="background:none; border:none; color:#94a3b8; font-size:20px; cursor:pointer; line-height:1;">✕</button>
            </div>

            <div style="padding:24px;">

                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                    <div>
                        <p style="margin:0; font-size:11px; color:#94a3b8; font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">Submitted By</p>
                        <p style="margin:4px 0 0 0; font-weight:700; color:#0f172a;">${r.therapistName}</p>
                    </div>
                    <span style="background:${stat.bg}; color:${stat.color}; padding:4px 14px; border-radius:20px; font-size:12px; font-weight:700;">
                        ${stat.text}
                    </span>
                </div>

                <div style="background:#f8fafc; border-radius:8px; padding:16px; margin-bottom:16px;">
                    <p style="margin:0 0 6px 0; font-size:11px; color:#94a3b8; font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">Description</p>
                    <p style="margin:0; font-size:14px; color:#334155; line-height:1.7;">${r.description}</p>
                </div>

                <div style="margin-bottom:16px;">
                    <label style="font-size:12px; font-weight:600; color:#475569; display:block; margin-bottom:6px;">
                        Admin Response <span style="color:#94a3b8; font-weight:400;">(visible to therapist)</span>
                    </label>
                    <textarea id="modal-admin-note" rows="3"
                        style="width:100%; padding:10px; border:1px solid #e5e7eb; border-radius:8px; font-size:13px; resize:vertical; font-family:inherit; box-sizing:border-box;"
                        placeholder="Write a response for the therapist...">${r.adminNote || ''}</textarea>
                </div>

                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                    ${r.status !== 'reviewed' ? `
                    <button onclick="updateReportFromModal('${r._id}', 'reviewed')"
                        style="background:#e0f2fe; color:#0284c7; border:none; padding:9px 16px; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; flex:1;">
                        <i class="fa-solid fa-magnifying-glass"></i> Mark Reviewed
                    </button>` : ''}

                    ${r.status !== 'resolved' ? `
                    <button onclick="updateReportFromModal('${r._id}', 'resolved')"
                        style="background:#dcfce7; color:#16a34a; border:none; padding:9px 16px; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; flex:1;">
                        <i class="fa-solid fa-circle-check"></i> Mark Resolved
                    </button>` : ''}

                    <button onclick="updateReportFromModal('${r._id}', '${r.status}', true)"
                        style="background:#0f172a; color:white; border:none; padding:9px 16px; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; flex:1;">
                        <i class="fa-solid fa-paper-plane"></i> Save Response
                    </button>
                </div>
            </div>
        </div>`;

    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

// =========================================
// UPDATE STATUS FROM MODAL
// =========================================
async function updateReportFromModal(reportId, status, noteOnly = false) {
    const note = document.getElementById('modal-admin-note')?.value.trim();

    try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(`${REPORTS_API}/reports/${reportId}/status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status, adminNote: note || '' })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        // Update local array
        const idx = allReports.findIndex(r => r._id === reportId);
        if (idx !== -1) allReports[idx] = data.report;

        document.getElementById('report-detail-modal')?.remove();
        renderReportsTable();

        // Update badge count
        const pending = allReports.filter(r => r.status === 'pending').length;
        const badge = document.getElementById('sidebar-reports-badge');
        if (badge) {
            badge.textContent = pending;
            badge.style.display = pending > 0 ? 'inline-flex' : 'none';
        }

    } catch (err) {
        alert('Failed to update: ' + err.message);
        console.error(err);
    }
}

// =========================================
// QUICK STATUS UPDATE (from table button)
// =========================================
async function quickUpdateStatus(reportId, status) {
    try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(`${REPORTS_API}/reports/${reportId}/status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        const idx = allReports.findIndex(r => r._id === reportId);
        if (idx !== -1) allReports[idx] = data.report;

        renderReportsTable();

    } catch (err) {
        alert('Failed: ' + err.message);
    }
}

// Expose for onclick
window.setReportFilter  = setReportFilter;
window.openReportDetail = openReportDetail;
window.updateReportFromModal = updateReportFromModal;
window.quickUpdateStatus = quickUpdateStatus;