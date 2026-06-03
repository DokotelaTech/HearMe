const API_BASE = '/api/admin';

let allUsers = [];

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = '/admin/login';
        return;
    }

    setupProfileDropdown();
    bindControls();
    loadUsers();
});

function setupProfileDropdown() {
    const profileBtn = document.getElementById('profileMenuBtn');
    const dropdown = document.getElementById('profileDropdown');
    if (!profileBtn || !dropdown) return;

    profileBtn.addEventListener('click', () => dropdown.classList.toggle('show'));

    document.addEventListener('click', (e) => {
        if (!profileBtn.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });

    document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
    });
}

function bindControls() {
    document.getElementById('refreshUsersBtn')?.addEventListener('click', loadUsers);
    document.getElementById('userSearchInput')?.addEventListener('input', renderUsers);
    document.getElementById('roleFilter')?.addEventListener('change', renderUsers);
    document.getElementById('statusFilter')?.addEventListener('change', renderUsers);
}

async function loadUsers() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Loading users from database...</td></tr>';

    try {
        const response = await fetch(`${API_BASE}/users`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Could not load users');
        }

        allUsers = data.users || [];
        renderUsers();
    } catch (error) {
        console.error('Error loading users:', error);
        tbody.innerHTML = `<tr><td colspan="6" class="empty-state error-state">${escapeHtml(error.message)}</td></tr>`;
    }
}

function renderUsers() {
    const tbody = document.getElementById('usersTableBody');
    const searchTerm = document.getElementById('userSearchInput')?.value.trim().toLowerCase() || '';
    const roleFilter = document.getElementById('roleFilter')?.value || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';

    const visibleUsers = allUsers.filter(user => {
        const status = user.accountStatus || 'active';
        const searchable = [
            user.email,
            user.role,
            status,
            user.username,
            user.anonymousName,
            user.firstName,
            user.lastName,
            user.licenseNumber
        ].filter(Boolean).join(' ').toLowerCase();

        return (!searchTerm || searchable.includes(searchTerm)) &&
            (!roleFilter || user.role === roleFilter) &&
            (!statusFilter || status === statusFilter);
    });

    if (visibleUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No matching accounts found.</td></tr>';
        return;
    }

    tbody.innerHTML = visibleUsers.map(user => createUserRow(user)).join('');
}

function createUserRow(user) {
    const status = user.accountStatus || 'active';
    const displayName = getDisplayName(user);
    const initials = getInitials(displayName || user.email);
    const joinedDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';
    const credentials = getCredentialSummary(user);
    const suspendLabel = status === 'suspended' ? 'Reactivate' : 'Suspend';
    const suspendIcon = status === 'suspended' ? 'fa-unlock' : 'fa-ban';

    return `
        <tr id="user-row-${user._id}">
            <td>
                <div class="account-cell">
                    <div class="account-avatar">${escapeHtml(initials)}</div>
                    <div>
                        <div class="account-name">${escapeHtml(displayName)}</div>
                        <div class="account-email">${escapeHtml(user.email || 'No email')}</div>
                    </div>
                </div>
            </td>
            <td><span class="role-chip role-${escapeHtml(user.role || 'unknown')}">${escapeHtml(user.role || 'unknown')}</span></td>
            <td><span class="status-chip status-${escapeHtml(status)}">${escapeHtml(status)}</span></td>
            <td>${escapeHtml(joinedDate)}</td>
            <td class="credential-cell">${credentials}</td>
            <td>
                <div class="table-actions">
                    <button type="button" class="btn-table btn-suspend" onclick="toggleSuspend('${user._id}', '${status}')">
                        <i class="fa-solid ${suspendIcon}"></i> ${suspendLabel}
                    </button>
                    <button type="button" class="btn-table btn-delete" onclick="deleteUser('${user._id}')">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        </tr>`;
}

function getDisplayName(user) {
    if (user.role === 'therapist') {
        return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Therapist';
    }

    return user.username || user.anonymousName || user.email || 'User';
}

function getInitials(value) {
    return String(value || '?')
        .split(/\s|@/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part.charAt(0).toUpperCase())
        .join('') || '?';
}

function getCredentialSummary(user) {
    if (user.role === 'therapist') {
        const license = user.licenseNumber ? `License: ${escapeHtml(user.licenseNumber)}` : 'No license';
        const status = user.profileStatus ? `Profile: ${escapeHtml(user.profileStatus)}` : 'Profile: N/A';
        return `<div>${license}</div><div class="muted-cell">${status}</div>`;
    }

    if (user.role === 'admin') {
        return '<span class="muted-cell">Admin account</span>';
    }

    return `<span class="muted-cell">${escapeHtml(user.anonymousName || 'Standard user account')}</span>`;
}

async function toggleSuspend(userId, currentStatus) {
    const shouldSuspend = currentStatus !== 'suspended';
    const label = shouldSuspend ? 'suspend' : 'reactivate';

    if (!confirm(`Are you sure you want to ${label} this account?`)) return;

    try {
        const response = await fetch(`${API_BASE}/users/${userId}/suspend`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ suspended: shouldSuspend })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || `Could not ${label} account`);
        }

        allUsers = allUsers.map(user => user._id === userId ? data.user : user);
        renderUsers();
    } catch (error) {
        alert(error.message);
    }
}

async function deleteUser(userId) {
    const user = allUsers.find(account => account._id === userId);
    const email = user?.email || getDisplayName(user || {});
    if (!confirm(`Delete ${email}? This permanently removes the account.`)) return;

    try {
        const response = await fetch(`${API_BASE}/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Could not delete account');
        }

        allUsers = allUsers.filter(user => user._id !== userId);
        renderUsers();
    } catch (error) {
        alert(error.message);
    }
}

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}
