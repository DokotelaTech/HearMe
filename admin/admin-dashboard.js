const API_BASE = 'http://localhost:5000/api/admin';

// ========================================
// PAGE LOAD
// ========================================

<<<<<<< HEAD
=======
// Add this at the very top of admin-dashboard.js
>>>>>>> 98ea0a3 (sprint 2)
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = '/admin/login';
        return;
    }

    setupNavigation();
    loadMetrics();
    loadPendingTherapists();
<<<<<<< HEAD
    loadReports(); // Step 5 — added after loadPendingTherapists
=======
>>>>>>> 98ea0a3 (sprint 2)
    setupProfileDropdown();
    initSettingsPopupSystem();
});

// ========================================
// SIDEBAR NAVIGATION
// ========================================

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');
    const currentRoute = document.getElementById('current-route');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            sections.forEach(section => section.classList.remove('active'));

            const target = item.getAttribute('data-target');
            const targetSection = document.getElementById(target);
            if (targetSection) targetSection.classList.add('active');

            currentRoute.textContent = `/admin/${target.replace('-view', '')}`;
        });
    });

    // Dropdown navigation
    const dropdownLinks = document.querySelectorAll('.dropdown-item[data-target]');
    dropdownLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('data-target');
            const matchingNav = document.querySelector(`.nav-item[data-target="${target}"]`);
            if (matchingNav) matchingNav.click();
        });
    });
}

// ========================================
// PROFILE DROPDOWN
// ========================================

function setupProfileDropdown() {
    const profileBtn = document.getElementById('profileMenuBtn');
    const dropdown = document.getElementById('profileDropdown');

    profileBtn.addEventListener('click', () => {
        dropdown.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
        if (!profileBtn.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });
}

// ========================================
// LOAD METRICS
// ========================================

async function loadMetrics() {
    try {
        const res = await fetch(`${API_BASE}/metrics`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        const data = await res.json();

        document.getElementById('metric-total-users').textContent = data.totalUsers;
        document.getElementById('metric-verified-workers').textContent = data.verifiedWorkers;
        document.getElementById('metric-pending-review').textContent = data.pendingReview;
<<<<<<< HEAD
        document.getElementById('metric-flagged-content').textContent = data.flaggedContent || 0; // Step 5 — updated
=======
        document.getElementById('metric-flagged-content').textContent = 0;
>>>>>>> 98ea0a3 (sprint 2)
    } catch (error) {
        console.error('Error loading metrics:', error);
    }
}

// ========================================
// LOAD PENDING THERAPISTS
// ========================================

async function loadPendingTherapists() {
    const container = document.getElementById('verification-queue-container');
    try {
        const res = await fetch(`${API_BASE}/pending-therapists`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        const data = await res.json();
        const therapists = data.therapists;

        container.innerHTML = '';

        if (!therapists || therapists.length === 0) {
            container.innerHTML = '<div class="empty-state">No pending therapists</div>';
            return;
        }

        therapists.forEach(t => {
            container.innerHTML += `
                <div class="worker-card" id="card-${t._id}">
                    <div class="worker-avatar">
                        ${t.profileImage
                            ? `<img src="${t.profileImage}" alt="Profile" style="width:60px;height:60px;border-radius:50%;object-fit:cover;">`
                            : `<div class="avatar-placeholder">${t.firstName?.charAt(0) || '?'}</div>`}
                    </div>
                    <div class="worker-info">
                        <h3>${t.firstName} ${t.lastName}</h3>
                        <p><i class="fa-solid fa-envelope"></i> ${t.email}</p>
                        <p><i class="fa-solid fa-graduation-cap"></i> ${t.qualification || 'N/A'}</p>
                        <p><i class="fa-solid fa-id-card"></i> License: ${t.licenseNumber || 'N/A'}</p>
                        <p><i class="fa-solid fa-briefcase"></i> ${t.specialization || 'N/A'}</p>
                        <p><i class="fa-solid fa-location-dot"></i> ${t.location || 'N/A'}</p>
                        ${t.credentialDocument
                            ? `<a href="${t.credentialDocument}" target="_blank" class="btn-view-doc">
                                   <i class="fa-solid fa-file-pdf"></i> View Credential
                               </a>`
                            : '<p style="color:#e53935;">No credential uploaded</p>'}
                    </div>
                    <div class="worker-actions">
                        <button class="btn btn-approve" onclick="approveTherapist('${t._id}')">
                            <i class="fa-solid fa-check"></i> Approve
                        </button>
                        <button class="btn btn-deny" onclick="denyTherapist('${t._id}')">
                            <i class="fa-solid fa-xmark"></i> Deny
                        </button>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        container.innerHTML = '<div class="empty-state">Failed to load queue.</div>';
        console.error('Error loading therapists:', error);
    }
}

// ========================================
// APPROVE THERAPIST
// ========================================

async function approveTherapist(id) {
    if (!confirm('Approve this therapist? They will receive a confirmation email.')) return;
    try {
        const res = await fetch(`${API_BASE}/approve/${id}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        const data = await res.json();
        alert(data.message);
        document.getElementById(`card-${id}`).remove();
        loadMetrics();
    } catch (err) {
        alert('Error approving therapist');
    }
}

// ========================================
// DENY THERAPIST
// ========================================

async function denyTherapist(id) {
    const reason = prompt('Enter reason for denial (optional):');
    try {
        const res = await fetch(`${API_BASE}/deny/${id}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason })
        });
        const data = await res.json();
        alert(data.message);
        document.getElementById(`card-${id}`).remove();
        loadMetrics();
    } catch (err) {
        alert('Error denying therapist');
    }
}

// ========================================
<<<<<<< HEAD
// LOAD REPORTS  (Step 5)
// ========================================

async function loadReports() {
    const tbody = document.getElementById('reports-table-body');
    try {
        const res = await fetch(`${API_BASE}/reports`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        const posts = await res.json();

        if (!posts.length) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No reports yet.</td></tr>';
            return;
        }

        // Update sidebar badge
        document.getElementById('sidebar-reports-badge').style.display = 'inline';
        document.getElementById('sidebar-reports-badge').textContent = posts.length;

        tbody.innerHTML = posts.map(post => `
            <tr>
                <td>${post.authorIdentifier}</td>
                <td>${post.reports.map(r => r.reason).join(', ')}</td>
                <td>${post.reports.map(r => r.reporterIdentifier).join(', ')}</td>
                <td>${new Date(post.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-deny" onclick="deleteReportedPost('${post._id}')">
                        <i class="fa-solid fa-trash"></i> Delete Post
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Failed to load reports.</td></tr>';
    }
}

// ========================================
// DELETE REPORTED POST  (Step 5)
// ========================================

async function deleteReportedPost(postId) {
    if (!confirm('Delete this post permanently?')) return;
    try {
        const res = await fetch(`${API_BASE}/posts/${postId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        if (res.ok) {
            alert('Post deleted.');
            loadReports();
        }
    } catch (err) {
        alert('Failed to delete post.');
    }
}

// ========================================
=======
>>>>>>> 98ea0a3 (sprint 2)
// SETTINGS MODAL
// ========================================

function initSettingsPopupSystem() {
    const dropdownMenu = document.getElementById('profileDropdown');
    const settingsModal = document.getElementById('settingsModal');
    const closeX = document.getElementById('closeSettingsX');
    const cancelBtn = document.getElementById('closeSettingsCancel');
    const settingsTriggerLink = document.querySelector('#profileDropdown [data-target="profile-view"]');

    if (settingsTriggerLink && settingsModal) {
        settingsTriggerLink.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (dropdownMenu) dropdownMenu.classList.remove('active');
            settingsModal.classList.add('is-visible');
        });
    }

    const hideActiveModalOverlay = () => settingsModal.classList.remove('is-visible');

    if (closeX) closeX.addEventListener('click', hideActiveModalOverlay);
    if (cancelBtn) cancelBtn.addEventListener('click', hideActiveModalOverlay);

    document.addEventListener('click', (event) => {
        if (event.target === settingsModal) hideActiveModalOverlay();
    });
}

// ========================================
// SETTINGS UPDATE
// ========================================

async function handleSettingsUpdate(event) {
    event.preventDefault();
    const settingsModal = document.getElementById('settingsModal');
    const saveBtn = event.target.querySelector('.btn-save-changes');

    saveBtn.innerText = 'Saving Changes...';
    saveBtn.disabled = true;

    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (settingsModal) settingsModal.classList.remove('is-visible');
    } catch (error) {
        console.error('Pipeline Sync Exception: ', error);
    } finally {
        saveBtn.innerText = 'Save Changes';
        saveBtn.disabled = false;
    }
}

<<<<<<< HEAD

async function loadReports() {
    const tbody = document.getElementById('reports-table-body');
    try {
        const res = await fetch('http://localhost:5000/api/reports', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        const data = await res.json();
        const reports = data.reports;

        if (!reports.length) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No reports yet.</td></tr>';
            document.getElementById('sidebar-reports-badge').style.display = 'none';
            document.getElementById('metric-flagged-content').textContent = 0;
            return;
        }

        const badge = document.getElementById('sidebar-reports-badge');
        badge.style.display = 'inline';
        badge.textContent = reports.length;
        document.getElementById('metric-flagged-content').textContent = reports.length;

        tbody.innerHTML = reports.map(r => `
            <tr id="report-row-${r._id}">
                <td>${r.postAuthor}</td>
                <td>${r.category}</td>
                <td>${r.reporterIdentifier}</td>
                <td>${new Date(r.createdAt).toLocaleDateString()}</td>
                <td style="display:flex; gap:8px;">
                    <button class="btn btn-deny" onclick="deleteReportedPost('${r._id}')">
                        <i class="fa-solid fa-trash"></i> Delete Post
                    </button>
                    <button class="btn btn-approve" onclick="dismissReport('${r._id}')">
                        <i class="fa-solid fa-check"></i> Dismiss
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Failed to load reports.</td></tr>';
    }
}

async function deleteReportedPost(reportId) {
    if (!confirm('Delete this post permanently?')) return;
    try {
        const res = await fetch(`http://localhost:5000/api/reports/${reportId}/delete-post`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        if (res.ok) { alert('Post deleted.'); loadReports(); loadMetrics(); }
        else alert('Failed to delete post.');
    } catch (err) { console.error(err); }
}

async function dismissReport(reportId) {
    if (!confirm('Dismiss this report?')) return;
    try {
        const res = await fetch(`http://localhost:5000/api/reports/${reportId}/dismiss`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });
        if (res.ok) { alert('Report dismissed.'); loadReports(); loadMetrics(); }
        else alert('Failed to dismiss.');
    } catch (err) { console.error(err); }
}

// ========================================
// LOGOUT
// ========================================

=======
// logout 
>>>>>>> 98ea0a3 (sprint 2)
document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
});