const API_BASE = '/api';
let groups = [];
let joinedGroups = [];
let activeGroupId = null;
let currentUserId = null;

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

/* =========================================
   RENDER ALL AVAILABLE GROUPS
========================================= */
function renderGroupsGrid() {
    const list = document.getElementById('groupsList');

    if (!groups.length) {
        list.innerHTML = '<p class="empty-state">No groups available yet. Check back soon!</p>';
        return;
    }

    list.innerHTML = groups.map(group => {
        const isMember = joinedGroups.some(g => g.id === group.id);

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
                    <span><i data-lucide="users"></i> ${group.memberCount} members</span>
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
                        <button class="btn-chat" data-chat="${group.id}">
                            <i data-lucide="message-circle"></i> Open Chat
                        </button>`
                        : `<button class="btn-join" data-join="${group.id}">
                            <i data-lucide="plus"></i> Join Group
                        </button>`
                    }
                </div>
            </article>
        `;
    }).join('');

    // Add event listeners
    document.querySelectorAll('.btn-join').forEach(btn => {
        btn.addEventListener('click', () => {
            const groupId = btn.dataset.join;
            joinGroup(groupId);
        });
    });

    document.querySelectorAll('.btn-chat').forEach(btn => {
        btn.addEventListener('click', () => {
            const groupId = btn.dataset.chat;
            openGroupChat(groupId);
        });
    });

    lucide.createIcons();
}

/* =========================================
   LOAD ALL GROUPS
========================================= */
async function loadGroups() {
    if (!requireUserSession()) return;

    const list = document.getElementById('groupsList');

    try {
        const data = await apiRequest('/groups');
        groups = data.groups || [];

        // Get user's joined groups
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        currentUserId = userData.id || userData.userId;

        joinedGroups = groups.filter(g => g.isMember);

        renderGroupsGrid();
    } catch (error) {
        list.innerHTML = `<p class="empty-state error">${escapeHtml(error.message)}</p>`;
    }
}

/* =========================================
   JOIN GROUP
========================================= */
async function joinGroup(groupId) {
    try {
        await apiRequest(`/groups/${groupId}/join`, 'POST');

        // Update local state
        const group = groups.find(g => g.id === groupId);
        if (group && !joinedGroups.some(g => g.id === groupId)) {
            joinedGroups.push(group);
            group.isMember = true;
            group.memberCount++;
        }

        renderGroupsGrid();

        // Show confirmation
        alert('Successfully joined the group! Opening chat...');
        setTimeout(() => openGroupChat(groupId), 500);
    } catch (error) {
        alert(`Failed to join group: ${error.message}`);
    }
}

/* =========================================
   RENDER GROUP MESSAGES (WhatsApp style)
========================================= */
function renderMessages(messages) {
    const chat = document.getElementById('groupChatMessages');

    if (!messages.length) {
        chat.innerHTML = '<p class="empty-state">No messages yet. Start the conversation!</p>';
        return;
    }

    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userIdentifier') || 'You';

    chat.innerHTML = messages.map(message => {
        const isUserMessage = message.senderId?.toString() === userId || 
                            message.senderRole === 'user';
        const messageClass = isUserMessage ? 'user-message' : 'other-message';
        const displayName = isUserMessage ? 'You' : escapeHtml(message.senderName || 'Member');
        const timeString = new Date(message.createdAt).toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="message-group ${messageClass}">
                ${!isUserMessage ? `<div class="message-sender">${displayName}</div>` : ''}
                <div class="message-content">
                    <p class="message-text">${escapeHtml(message.message)}</p>
                    <span class="message-time">${timeString}</span>
                </div>
            </div>
        `;
    }).join('');

    chat.scrollTop = chat.scrollHeight;
}

/* =========================================
   OPEN GROUP CHAT
========================================= */
async function openGroupChat(groupId) {
    const group = groups.find(item => item.id === groupId);
    if (!group) return;

    activeGroupId = groupId;
    
    // Update chat header
    const header = document.getElementById('activeGroupTitle');
    const meta = document.getElementById('activeGroupMeta');
    const input = document.getElementById('groupMessageInput');
    const sendBtn = document.getElementById('sendGroupMessage');

    if (header) header.textContent = group.name;
    if (meta) meta.textContent = `${group.category} • ${group.memberCount} members • Hosted by ${group.therapistName}`;

    // Enable input
    if (input) input.disabled = false;
    if (sendBtn) sendBtn.disabled = false;

    try {
        const data = await apiRequest(`/groups/${groupId}/messages`);
        renderMessages(data.messages || []);
    } catch (error) {
        console.error('Error loading group messages:', error);
    }
}

/* =========================================
   SEND GROUP MESSAGE
========================================= */
async function sendMessage() {
    const input = document.getElementById('groupMessageInput');
    const message = input.value.trim();

    if (!activeGroupId || !message) return;

    try {
        await apiRequest(`/groups/${activeGroupId}/messages`, 'POST', { message });
        input.value = '';
        await openGroupChat(activeGroupId);
    } catch (error) {
        alert(`Failed to send message: ${error.message}`);
    }
}

/* =========================================
   EVENT LISTENERS
========================================= */
document.addEventListener('DOMContentLoaded', () => {
    const sendBtn = document.getElementById('sendGroupMessage');
    const input = document.getElementById('groupMessageInput');

    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }

    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    // Load groups on page load
    loadGroups();

    lucide.createIcons();
});

/* =========================================
   FILTER GROUPS BY CATEGORY
========================================= */
document.addEventListener('DOMContentLoaded', () => {
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const category = btn.textContent;

            if (category === 'All Groups') {
                renderGroupsGrid();
            } else {
                const filtered = groups.filter(g => g.category === category);
                const list = document.getElementById('groupsList');
                
                if (!filtered.length) {
                    list.innerHTML = `<p class="empty-state">No groups found in ${category}</p>`;
                    return;
                }

                // Re-render with filtered groups temporarily
                const originalGroups = groups;
                groups = filtered;
                renderGroupsGrid();
                groups = originalGroups;
            }
        });
    });
});

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