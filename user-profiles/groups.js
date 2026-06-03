const API_BASE = '/api';
let groups = [];
let joinedGroups = [];
let activeGroupId = null;
let currentUserId = null;

function token() {
    return localStorage.getItem('token');
}

function getStoredUser() {
    try {
        return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
        return {};
    }
}

function getCurrentUserId() {
    if (currentUserId) return currentUserId;

    const user = getStoredUser();
    currentUserId = String(user.id || user._id || user.userId || localStorage.getItem('userId') || '');
    return currentUserId;
}

function requireUserSession() {
    if (!token() || localStorage.getItem('role') !== 'user') {
        alert('Please sign in as a user to view groups.');
        window.location.href = '/login';
        return false;
    }

    getCurrentUserId();
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

function groupId(group) {
    return String(group.id || group._id);
}

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function renderGroupsGrid(sourceGroups = groups) {
    const list = document.getElementById('groupsList');

    if (!sourceGroups.length) {
        list.innerHTML = '<p class="empty-state">No groups available yet. Check back soon!</p>';
        return;
    }

    list.innerHTML = sourceGroups.map(group => {
        const id = groupId(group);
        const isMember = group.isMember || joinedGroups.some(joined => groupId(joined) === id);

        return `
            <article class="group-card">
                <div class="group-card-header">
                    <div class="group-avatar">${escapeHtml(group.name.substring(0, 2).toUpperCase())}</div>
                    <span class="category-tag">${escapeHtml(group.category)}</span>
                </div>

                <h3 class="group-title">${escapeHtml(group.name)}</h3>
                <p class="group-description">${escapeHtml(group.description)}</p>

                <div class="group-meta">
                    <span><i data-lucide="user-round"></i> ${escapeHtml(group.therapistName)}</span>
                    <span><i data-lucide="users"></i> ${group.memberCount || 0} members</span>
                </div>

                <div class="group-meeting-time">
                    <i data-lucide="calendar-clock"></i>
                    <span>${escapeHtml(group.meetingTime || 'Schedule TBD')}</span>
                </div>

                <div class="group-actions">
                    ${isMember
                        ? `<button class="btn-joined" disabled>
                            <i data-lucide="check"></i> Joined
                        </button>
                        <button class="btn-chat" data-chat="${id}">
                            <i data-lucide="message-circle"></i> Open Chat
                        </button>`
                        : `<button class="btn-join" data-join="${id}">
                            <i data-lucide="plus"></i> Join Group
                        </button>`
                    }
                </div>
            </article>
        `;
    }).join('');

    lucide.createIcons();
}

async function loadGroups() {
    const list = document.getElementById('groupsList');

    try {
        const data = await apiRequest('/groups');
        groups = data.groups || [];
        joinedGroups = groups.filter(group => group.isMember);
        renderGroupsGrid();
    } catch (error) {
        list.innerHTML = `<p class="empty-state error">${escapeHtml(error.message)}</p>`;
    }
}

async function joinGroup(groupIdToJoin) {
    await apiRequest(`/groups/${groupIdToJoin}/join`, 'POST');

    const group = groups.find(item => groupId(item) === groupIdToJoin);
    if (group && !joinedGroups.some(joined => groupId(joined) === groupIdToJoin)) {
        group.isMember = true;
        group.memberCount = (group.memberCount || 0) + 1;
        joinedGroups.push(group);
    }

    renderGroupsGrid();
    await openGroupChat(groupIdToJoin);
}

function renderMessages(messages) {
    const chat = document.getElementById('groupChatMessages');

    if (!messages.length) {
        chat.innerHTML = '<p class="empty-state">No messages yet. Start the conversation!</p>';
        return;
    }

    const userId = getCurrentUserId();

    chat.innerHTML = messages.map(message => {
        const senderId = message.senderId?._id || message.senderId;
        const isOwnMessage = senderId?.toString() === userId;
        const messageClass = isOwnMessage ? 'user-message' : 'other-message';
        const displayName = isOwnMessage ? 'You' : escapeHtml(message.senderName || 'Member');

        return `
            <div class="message-group ${messageClass}">
                ${!isOwnMessage ? `<div class="message-sender">${displayName}</div>` : ''}
                <div class="message-content">
                    <p class="message-text">${escapeHtml(message.message)}</p>
                    <span class="message-time">${formatTime(message.createdAt)}</span>
                </div>
            </div>
        `;
    }).join('');

    chat.scrollTop = chat.scrollHeight;
}

async function openGroupChat(groupIdToOpen) {
    const group = groups.find(item => groupId(item) === groupIdToOpen);
    if (!group) return;

    activeGroupId = groupIdToOpen;

    const header = document.getElementById('activeGroupTitle');
    const meta = document.getElementById('activeGroupMeta');
    const input = document.getElementById('groupMessageInput');
    const sendBtn = document.getElementById('sendGroupMessage');

    if (header) header.textContent = group.name;
    if (meta) {
        meta.textContent = `${group.category} - ${group.memberCount || 0} members - Hosted by ${group.therapistName}`;
    }
    if (input) input.disabled = false;
    if (sendBtn) sendBtn.disabled = false;

    const data = await apiRequest(`/groups/${groupIdToOpen}/messages`);
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

function bindFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(button => button.classList.remove('active'));
            btn.classList.add('active');

            const category = btn.textContent.trim();
            const filtered = category === 'All Groups'
                ? groups
                : groups.filter(group => group.category === category);

            renderGroupsGrid(filtered);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    if (!requireUserSession()) return;

    loadGroups();
    bindFilters();

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
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
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
