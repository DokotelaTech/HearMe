const API_BASE = '/api';
let groups = [];
let activeGroupId = null;

function token() {
    return localStorage.getItem('token');
}

function requireUserSession() {
    if (!token() || localStorage.getItem('role') !== 'user') {
        alert('Please sign in as a user to view groups.');
        window.location.href = '/login';
        return false;
    }

    return true;
}

async function apiRequest(endpoint, method = 'GET', body = null) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token()}`
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
    const list = document.getElementById('groupsList');

    if (!groups.length) {
        list.innerHTML = '<p class="empty-state">No therapist groups are available yet.</p>';
        return;
    }

    list.innerHTML = groups.map(group => `
        <article class="group-card">
            <div class="group-title-row">
                <h3>${escapeHtml(group.name)}</h3>
                <span class="category-tag">${escapeHtml(group.category)}</span>
            </div>

            <div class="group-meta">
                <span><i data-lucide="user-round"></i> ${escapeHtml(group.therapistName)}</span>
                <span><i data-lucide="users"></i> ${group.memberCount} members</span>
            </div>

            <p class="description">${escapeHtml(group.description)}</p>

            <div class="next-session">
                <i data-lucide="calendar-clock"></i>
                <span>${escapeHtml(group.meetingTime || 'Schedule shared in group chat')}</span>
            </div>

            <div class="group-actions">
                ${group.isMember
                    ? `<button class="joined-status">Joined</button>
                       <button class="view-chat-btn" data-chat="${group.id}"><i data-lucide="message-circle"></i> View Chat</button>`
                    : `<button class="join-group-btn" data-join="${group.id}">Join Group</button>`
                }
            </div>
        </article>
    `).join('');

    lucide.createIcons();
}

async function loadGroups() {
    const list = document.getElementById('groupsList');

    try {
        const data = await apiRequest('/groups');
        groups = data.groups || [];
        renderGroups();
    } catch (error) {
        list.innerHTML = `<p class="empty-state error">${escapeHtml(error.message)}</p>`;
    }
}

async function joinGroup(groupId) {
    await apiRequest(`/groups/${groupId}/join`, 'POST');
    await loadGroups();
    openGroupChat(groupId);
}

function renderMessages(messages) {
    const chat = document.getElementById('groupChatMessages');

    if (!messages.length) {
        chat.innerHTML = '<p class="empty-state">No messages yet. Start the conversation gently.</p>';
        return;
    }

    chat.innerHTML = messages.map(message => `
        <div class="group-message ${message.senderRole === 'user' ? 'member' : 'therapist'}">
            <div class="message-top">
                <strong>${escapeHtml(message.senderName)}</strong>
                <span>${new Date(message.createdAt).toLocaleString()}</span>
            </div>
            <p>${escapeHtml(message.message)}</p>
        </div>
    `).join('');

    chat.scrollTop = chat.scrollHeight;
}

async function openGroupChat(groupId) {
    const group = groups.find(item => item.id === groupId);
    if (!group || !group.isMember) return;

    activeGroupId = groupId;
    document.getElementById('activeGroupTitle').textContent = group.name;
    document.getElementById('activeGroupMeta').textContent = `${group.category} • Hosted by ${group.therapistName}`;
    document.getElementById('groupMessageInput').disabled = false;
    document.getElementById('sendGroupMessage').disabled = false;

    const data = await apiRequest(`/groups/${groupId}/messages`);
    renderMessages(data.messages || []);
}

async function sendMessage() {
    const input = document.getElementById('groupMessageInput');
    const message = input.value.trim();

    if (!activeGroupId || !message) return;

    await apiRequest(`/groups/${activeGroupId}/messages`, 'POST', { message });
    input.value = '';
    await openGroupChat(activeGroupId);
}

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    if (!requireUserSession()) return;

    loadGroups();

    document.getElementById('groupsList').addEventListener('click', async (event) => {
        const joinId = event.target.closest('[data-join]')?.dataset.join;
        const chatId = event.target.closest('[data-chat]')?.dataset.chat;

        try {
            if (joinId) await joinGroup(joinId);
            if (chatId) await openGroupChat(chatId);
        } catch (error) {
            alert(error.message);
        }
    });

    document.getElementById('sendGroupMessage').addEventListener('click', () => {
        sendMessage().catch(error => alert(error.message));
    });

    document.getElementById('groupMessageInput').addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            sendMessage().catch(error => alert(error.message));
        }
    });

    const trigger = document.getElementById('dropdownTrigger');
    const menu = document.getElementById('dropdownMenu');

    if (trigger && menu) {
        trigger.addEventListener('click', (event) => {
            event.stopPropagation();
            menu.classList.toggle('show');
        });

        document.addEventListener('click', (event) => {
            if (!trigger.contains(event.target) && !menu.contains(event.target)) {
                menu.classList.remove('show');
            }
        });
    }
});