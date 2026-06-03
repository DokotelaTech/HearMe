(() => {
    const API_BASE = '/api';
    let therapistGroups = [];
    let selectedGroupId = null;

    function getToken() {
        return sessionStorage.getItem('token') || localStorage.getItem('token');
    }

    function getRole() {
        return sessionStorage.getItem('userRole') || localStorage.getItem('role');
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
            <article class="therapist-group-card ${selectedGroupId === group.id ? 'active' : ''}" data-group-id="${group.id}">
                <div>
                    <h3>${escapeHtml(group.name)}</h3>
                    <p>${escapeHtml(group.description)}</p>
                </div>
                <div class="therapist-group-meta">
                    <span><i class="fa-solid fa-tag"></i> ${escapeHtml(group.category)}</span>
                    <span><i class="fa-solid fa-calendar-clock"></i> ${escapeHtml(group.meetingTime || 'Flexible schedule')}</span>
                    <span><i class="fa-solid fa-users"></i> ${group.memberCount || 0} members</span>
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

        const group = therapistGroups.find(item => item.id === groupId);
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
        await loadGroups();
    }

    function formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function renderMessages(messages) {
        const panel = document.getElementById('therapistGroupMessages');

        if (!messages.length) {
            panel.innerHTML = '<p class="inbox-empty" style="color: #6b7280; text-align: center; margin-top: 20px;">No messages yet. Start the group conversation.</p>';
            return;
        }

        panel.innerHTML = messages.map(message => {
            const isTherapistMessage = message.senderRole === 'therapist';
            return `
                <div style="display: flex; justify-content: ${isTherapistMessage ? 'flex-end' : 'flex-start'}; margin-bottom: 12px;">
                    <div style="max-width: 75%; background: ${isTherapistMessage ? '#0d9488' : '#ffffff'}; color: ${isTherapistMessage ? '#ffffff' : '#111827'}; border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px 12px;">
                        ${!isTherapistMessage ? `<strong style="display: block; font-size: 12px; margin-bottom: 4px; color: #2563eb;">${escapeHtml(message.senderName || 'Member')}</strong>` : ''}
                        <p style="margin: 0; line-height: 1.4;">${escapeHtml(message.message)}</p>
                        <span style="display: block; margin-top: 6px; font-size: 11px; opacity: 0.75;">${formatTime(message.createdAt)}</span>
                    </div>
                </div>
            `;
        }).join('');

        panel.scrollTop = panel.scrollHeight;
    }

    async function openGroupChat(groupId) {
        selectedGroupId = groupId;
        renderGroups();

        const group = therapistGroups.find(item => item.id === groupId);
        if (group) {
            document.getElementById('selectedGroupLabel').textContent = `Managing members for ${group.name}`;
        }

        document.getElementById('therapistGroupMessageInput').disabled = false;
        document.getElementById('therapistSendGroupMessage').disabled = false;

        const data = await apiRequest(`/groups/${groupId}/messages`);
        renderMessages(data.messages || []);
        await loadMembers(groupId);
    }

    async function sendMessage() {
        const input = document.getElementById('therapistGroupMessageInput');
        const message = input.value.trim();

        if (!selectedGroupId || !message) return;

        await apiRequest(`/groups/${selectedGroupId}/messages`, 'POST', { message });
        input.value = '';
        await openGroupChat(selectedGroupId);
    }

    async function scheduleEvent(event) {
        event.preventDefault();

        if (!selectedGroupId) {
            alert('Select a group before scheduling an event.');
            return;
        }

        await apiRequest(`/groups/${selectedGroupId}/events`, 'POST', {
            title: document.getElementById('eventTitle').value.trim(),
            date: document.getElementById('eventDate').value,
            time: document.getElementById('eventTime').value,
            notes: document.getElementById('eventNotes').value.trim()
        });

        event.target.reset();
        document.getElementById('eventModal').classList.remove('show');
        await loadGroups();
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (!getToken() || getRole() !== 'therapist') {
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
                openGroupChat(card.dataset.groupId).catch(error => alert(error.message));
            }
        });

        document.getElementById('groupMembersList').addEventListener('click', (event) => {
            const memberId = event.target.closest('[data-remove-member]')?.dataset.removeMember;
            if (memberId) {
                removeMember(memberId).catch(error => alert(error.message));
            }
        });

        document.getElementById('therapistSendGroupMessage').addEventListener('click', () => {
            sendMessage().catch(error => alert(error.message));
        });

        document.getElementById('therapistGroupMessageInput').addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendMessage().catch(error => alert(error.message));
            }
        });

        document.getElementById('groupEventForm').addEventListener('submit', (event) => {
            scheduleEvent(event).catch(error => alert(error.message));
        });
    });
})();
