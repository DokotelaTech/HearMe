// Database Backend API Endpoint Pointer Base
const API_BASE_URL = window.location.origin + '/api';

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initProfileDropdown();
    
    // Asynchronous database calls to pull fresh layout metrics from data layer
    fetchDashboardMetrics();
    fetchPendingWorkers();
    fetchUserReports();
    fetchAdminProfile();
});

// --- NAVIGATION ENGINE ---
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item, .dropdown-item');
    const sections = document.querySelectorAll('.content-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const targetId = item.getAttribute('data-target');
            if (!targetId) return;
            e.preventDefault();
            
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            sections.forEach(sec => sec.classList.remove('active'));

            const correspondingSidebarLink = document.querySelector(`.nav-item[data-target="${targetId}"]`);
            if (correspondingSidebarLink) correspondingSidebarLink.classList.add('active');
            
            document.getElementById(targetId).classList.add('active');
            document.getElementById('profileDropdown').classList.remove('show');
            document.getElementById('current-route').innerText = `/admin/${targetId.replace('-view', '')}`;
        });
    });

    document.getElementById('flagged-card').addEventListener('click', () => {
        document.querySelector('[data-target="reports-view"]').click();
    });
}

function initProfileDropdown() {
    const profileMenuBtn = document.getElementById('profileMenuBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    
    profileMenuBtn.addEventListener('click', (e) => { e.stopPropagation(); profileDropdown.classList.toggle('show'); });
    document.addEventListener('click', () => profileDropdown.classList.remove('show'));

    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm("Terminate admin system access authorization?")) {
            window.location.href = "/login.html"; 
        }
    });
}

// --- ASYNCHRONOUS BACKEND DATABASE FETCH METHODS ---

async function fetchDashboardMetrics() {
    try {
        const response = await fetch(`${API_BASE_URL}/metrics`);
        const data = await response.json();
        
        document.getElementById('metric-total-users').innerText = data.totalUsers;
        document.getElementById('metric-verified-workers').innerText = data.verifiedWorkers;
    } catch (err) {
        console.error("Failed syncing dashboard metric modules:", err);
    }
}

async function fetchPendingWorkers() {
    const container = document.getElementById('verification-queue-container');
    try {
        const response = await fetch(`${API_BASE_URL}/workers/pending`);
        const workers = await response.json();
        
        document.getElementById('metric-pending-review').innerText = workers.length;
        container.innerHTML = '';

        if (workers.length === 0) {
            container.innerHTML = `<div class="empty-state"><p>Queue clean! No pending worker files await manual review.</p></div>`;
            return;
        }

        workers.forEach(worker => {
            const card = document.createElement('div');
            card.className = 'verification-card';
            card.innerHTML = `
                <div class="worker-profile-header">
                    <div class="worker-details">
                        <h3>${worker.name}</h3>
                        <p class="worker-email"><i class="fa-regular fa-envelope"></i> ${worker.email}</p>
                        <p class="worker-exp"><strong>Experience:</strong> ${worker.experience_years} Years</p>
                        <p class="worker-sub"><strong>Submitted:</strong> ${new Date(worker.created_at).toLocaleDateString()}</p>
                    </div>
                    <div class="worker-avatar" style="background-color:#a855f7">${worker.name.charAt(0)}</div>
                </div>
                <div class="document-box">
                    <p><i class="fa-solid fa-file-lines"></i> Professional Credentials License Link</p>
                    <a href="${worker.document_url}" target="_blank" class="view-link">Open Verified Document PDF →</a>
                </div>
                <div class="action-buttons">
                    <button class="btn btn-approve" onclick="processWorkerAction('${worker.id}', true)">Approve & Verify Account</button>
                    <button class="btn btn-reject" onclick="processWorkerAction('${worker.id}', false)">Reject Application</button>
                </div>`;
            container.appendChild(card);
        });
    } catch (err) {
        container.innerHTML = `<p class="loading-spinner" style="color:var(--danger)">Database connectivity error encountered parsing profile requests.</p>`;
    }
}

async function fetchUserReports() {
    const tableBody = document.getElementById('reports-table-body');
    try {
        const response = await fetch(`${API_BASE_URL}/reports`);
        const reports = await response.json();
        
        document.getElementById('metric-flagged-content').innerText = reports.length;
        const badge = document.getElementById('sidebar-reports-badge');
        badge.innerText = reports.length;
        badge.style.display = reports.length > 0 ? 'inline-block' : 'none';
        
        tableBody.innerHTML = '';

        if (reports.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="empty-state"><p>Platform serene! Zero user reports log matching indicators.</p></td></tr>`;
            return;
        }

        reports.forEach(report => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${report.reported_username}</strong></td>
                <td><span class="incident-type">${report.violation_type}</span> - ${report.description_context}</td>
                <td>${report.reporter_name}</td>
                <td>${new Date(report.reported_at).toLocaleDateString()}</td>
                <td>
                    <button class="action-btn ban-btn" onclick="processReportAction(${report.id}, 'ban')">Ban</button>
                    <button class="action-btn warn-btn" onclick="processReportAction(${report.id}, 'warn')">Warn</button>
                    <button class="action-btn dismiss-btn" onclick="processReportAction(${report.id}, 'dismiss')">Dismiss</button>
                </td>`;
            tableBody.appendChild(row);
        });
    } catch (err) {
        tableBody.innerHTML = `<tr><td colspan="5" class="empty-state" style="color:var(--danger)">Failed fetching data packages.</td></tr>`;
    }
}

async function fetchAdminProfile() {
    try {
        const response = await fetch(`${API_BASE_URL}/profile`);
        const profile = await response.json();
        
        const initial = profile.full_name.charAt(0);
        document.getElementById('header-avatar').innerText = initial;
        document.getElementById('profile-large-avatar').innerText = initial;
        document.getElementById('profile-name').innerText = profile.full_name;
        document.getElementById('profile-email').innerText = profile.email;
        
        const logsContainer = document.getElementById('audit-logs-container');
        logsContainer.innerHTML = '';
        
        profile.auditLogs.forEach(log => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(log.timestamp).toLocaleString()}</td>
                <td>${log.action_context_string}</td>
                <td><code>${log.ip_address}</code></td>`;
            logsContainer.appendChild(row);
        });
    } catch (err) {
        console.error("Profile connection state fault:", err);
    }
}

// --- DATABASE POST/PUT STRATEGIES WRITING MODIFICATIONS BACK TO SERVER ---

async function processWorkerAction(workerId, approveBoolean) {
    try {
        const response = await fetch(`${API_BASE_URL}/workers/verify/${workerId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ approved: approveBoolean })
        });
        if(response.ok) {
            alert(approveBoolean ? "Social Worker Approved!" : "Application Rejected.");
            fetchPendingWorkers(); 
            fetchDashboardMetrics();
        }
    } catch (err) { alert("Network fault writing verification execution strategy."); }
}

async function processReportAction(reportId, actionVerb) {
    try {
        const response = await fetch(`${API_BASE_URL}/reports/${reportId}/action`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: actionVerb })
        });
        if(response.ok) {
            alert(`Report updated successfully: Strategy: [${actionVerb.toUpperCase()}].`);
            fetchUserReports(); 
            fetchDashboardMetrics();
        }
    } catch (err) { alert("Communication loop fault processing ticket update."); }
}

async function handlePasswordChange(e) {
    e.preventDefault();
    const oldP = document.getElementById('password-old').value;
    const newP = document.getElementById('password-new').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/profile/password`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ oldP, newP })
        });
        if (response.ok) {
            alert("Administrative authorization access credentials modified successfully.");
            document.getElementById('passwordChangeForm').reset();
            fetchAdminProfile();
        } else {
            alert("Error altering credentials. Ensure input is correct.");
        }
    } catch (err) { alert("API Connection error changing password."); }
}