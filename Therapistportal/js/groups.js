(() => {
    const API_BASE = 'http://localhost:5000/api';
    let therapistGroups = [];
    let selectedGroupId = null;

    function getToken() {
        return localStorage.getItem('token');
    }

    async function apiRequest(endpoint, method = 'GET', body = null) {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getToken()}`
            },
            body: body ? JSON.stringify(body) : null
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong.');
        }

        return data;
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function renderGroups() {
        const container = document.getElementById('therapistGroupsList');

        if (!therapistGroups.length) {
            container.innerHTML = '<p class="inbox-empty">No groups yet. Create your first support group.</p>';
            return;
        }

        container.innerHTML = therapistGroups.map(group => `
            <article class="therapist-group-card ${selectedGroupId === group._id ? 'active' : ''}" data-group-id="${group._id}">
                <div>
                    <h3>${escapeHtml(group.name)}</h3>
                    <p>${escapeHtml(group.description)}</p>
                </div>
                <div class="therapist-group-meta">
                    <span><i class="fa-solid fa-tag"></i> ${escapeHtml(group.category)}</span>
                    <span><i class="fa-solid fa-calendar-clock"></i> ${escapeHtml(group.meetingTime || 'Flexible schedule')}</span>
                    <span><i class="fa-solid fa-users"></i> ${group.members?.length || 0} members</span>
                </div>
            </article>
        `).join('');
    }

    async function loadGroups() {
        const data = await apiRequest('/groups/mine');
        therapistGroups = data.groups || [];
        renderGroups();
    }

    async function loadMembers(groupId) {
        selectedGroupId = groupId;
        renderGroups();

        const group = therapistGroups.find(item => item._id === groupId);
        document.getElementById('selectedGroupLabel').textContent =
            group ? `Managing members for ${group.name}` : 'Members';

        const data = await apiRequest(`/groups/${groupId}/members`);
        const list = document.getElementById('groupMembersList');

        if (!data.members.length) {
            list.innerHTML = '<p class="inbox-empty">No users have joined this group yet.</p>';
            return;
        }

        list.innerHTML = data.members.map(member => `
            <div class="group-member-row">
                <div>
                    <strong>${escapeHtml(member.name)}</strong>
                    <span>${escapeHtml(member.email)}</span>
                </div>
                <button data-remove-member="${member.id}">
                    Remove
                </button>
            </div>
        `).join('');
    }

    async function createGroup(event) {
        event.preventDefault();

        const body = {
            name: document.getElementById('groupName').value.trim(),
            category: document.getElementById('groupCategory').value.trim(),
            meetingTime: document.getElementById('groupMeetingTime').value.trim(),
            description: document.getElementById('groupDescription').value.trim()
        };

        await apiRequest('/groups', 'POST', body);
        event.target.reset();
        await loadGroups();
    }

    async function removeMember(memberId) {
        if (!selectedGroupId) return;

        await apiRequest(`/groups/${selectedGroupId}/members/${memberId}`, 'DELETE');
        await loadMembers(selectedGroupId);
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (!getToken() || localStorage.getItem('role') !== 'therapist') {
            alert('Please sign in as a therapist to manage groups.');
            window.location.href = '/login';
            return;
        }

        loadGroups().catch(error => {
            document.getElementById('therapistGroupsList').innerHTML =
                `<p class="inbox-empty">${escapeHtml(error.message)}</p>`;
        });

        document.getElementById('createGroupForm').addEventListener('submit', (event) => {
            createGroup(event).catch(error => alert(error.message));
        });

        document.getElementById('therapistGroupsList').addEventListener('click', (event) => {
            const card = event.target.closest('[data-group-id]');
            if (card) {
                loadMembers(card.dataset.groupId).catch(error => alert(error.message));
            }
        });

        document.getElementById('groupMembersList').addEventListener('click', (event) => {
            const memberId = event.target.closest('[data-remove-member]')?.dataset.removeMember;
            if (memberId) {
                removeMember(memberId).catch(error => alert(error.message));
            }
        });
    });
})();