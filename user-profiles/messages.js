const API_BASE = 'http://localhost:5000/api';
let therapistInboxData = { conversations: [], unreadTotal: 0 };
let groupInboxData = { groups: [] };
let activeTherapistId = null;
let activeGroupId = null;
let currentChatType = 'therapists';
let markingRead = false;

lucide.createIcons();

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatTime(dateString) {
    return new Date(dateString).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
}

function getToken() {
    const token = authStorage.get('token');
    const role = authStorage.get('userRole');

    if (!token || role !== 'user') {
        alert('Please sign in as a User to view messages.');
        window.location.href = '../landing-page/login.html';
        return null;
    }

    return token;
}

async function parseApiResponse(response) {
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
        throw new Error('Server error. Restart npm start and sign in again.');
    }
    return response.json();
}

function handleAuthError(status, message) {
    if (status === 401 || message?.toLowerCase().includes('token')) {
        authStorage.clear();
        alert(message || 'Session expired. Please sign in again.');
        window.location.href = '../landing-page/login.html';
        return true;
    }
    return false;
}

function therapistInitials(name) {
    return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'TH';
}

function groupInitials(name) {
    return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'GP';
}

/* =========================================
   TAB SWITCHING
========================================= */
document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.inbox-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            switchTab(targetTab);
        });
    });

    loadAllConversations();
});

function switchTab(tabName) {
    currentChatType = tabName;
    
    // Update tab styling
    document.querySelectorAll('.inbox-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Show/hide inbox lists
    document.querySelectorAll('.inbox-list').forEach(list => {
        list.classList.add('hidden');
    });
    
    if (tabName === 'therapists') {
        document.getElementById('therapist-inbox-list').classList.remove('hidden');
        if (activeTherapistId) {
            showConversation(activeTherapistId, true, 'therapist');
        }
    } else {
        document.getElementById('group-inbox-list').classList.remove('hidden');
        if (activeGroupId) {
            showGroupChat(activeGroupId);
        }
    }
}

/* =========================================
   LOAD THERAPIST CONVERSATIONS
========================================= */
async function loadTherapistInbox() {
    const token = getToken();
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE}/messages/user-inbox`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.status === 404) {
            throw new Error('Messages API not found.');
        }

        const data = await parseApiResponse(response);
        if (!response.ok) {
            if (handleAuthError(response.status, data.message)) return;
            throw new Error(data.message || 'Could not load messages.');
        }

        therapistInboxData = data;
        renderTherapistInboxList();
    } catch (error) {
        console.error('Error loading therapist inbox:', error);
    }
}

/* =========================================
   LOAD GROUP CONVERSATIONS
========================================= */
async function loadGroupInbox() {
    const token = getToken();
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE}/groups`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const data = await parseApiResponse(response);
        if (!response.ok) {
            if (handleAuthError(response.status, data.message)) return;
            throw new Error(data.message || 'Could not load groups.');
        }

        // Filter only joined groups
        groupInboxData.groups = (data.groups || []).filter(g => g.isMember);
        renderGroupInboxList();
    } catch (error) {
        console.error('Error loading groups:', error);
    }
}

async function loadAllConversations() {
    await loadTherapistInbox();
    await loadGroupInbox();
}

/* =========================================
   RENDER THERAPIST INBOX
========================================= */
function renderTherapistInboxList() {
    const inboxList = document.getElementById('therapist-inbox-list');
    if (!inboxList) return;

    if (!therapistInboxData.conversations.length) {
        inboxList.innerHTML =
            '<p class="inbox-empty">No messages yet. Contact a therapist from the <a href="experts.html">Experts</a> page.</p>';
        return;
    }

    inboxList.innerHTML = therapistInboxData.conversations
        .map((conversation) => {
            const therapistId = conversation.therapistId.toString();
            const preview = conversation.lastMessage?.content?.slice(0, 50) || '';
            const isActive = activeTherapistId === therapistId && currentChatType === 'therapists';
            const badge =
                conversation.unreadCount > 0
                    ? `<span class="unread-badge">${conversation.unreadCount}</span>`
                    : '';

            return `
                <div class="inbox-item ${isActive ? 'active' : ''}" data-therapist-id="${therapistId}">
                    <div class="chat-avatar">${escapeHtml(therapistInitials(conversation.therapistName))}</div>
                    <div class="inbox-details">
                        <div style="display:flex;justify-content:space-between;gap:8px;">
                            <strong>${escapeHtml(conversation.therapistName)}</strong>
                            <span class="inbox-time">${formatTime(conversation.lastMessage.createdAt)}</span>
                        </div>
                        <p>${escapeHtml(preview)}${preview.length >= 50 ? '...' : ''}</p>
                    </div>
                    ${badge}
                </div>
            `;
        })
        .join('');

    document.querySelectorAll('#therapist-inbox-list .inbox-item').forEach((item) => {
        item.addEventListener('click', () => {
            showConversation(item.getAttribute('data-therapist-id'), true, 'therapist');
        });
    });

    lucide.createIcons();
}

/* =========================================
   RENDER GROUP INBOX
========================================= */
function renderGroupInboxList() {
    const inboxList = document.getElementById('group-inbox-list');
    if (!inboxList) return;

    if (!groupInboxData.groups.length) {
        inboxList.innerHTML =
            '<p class="inbox-empty">No groups joined yet. Join one from the <a href="groups.html">Groups</a> page.</p>';
        return;
    }

    inboxList.innerHTML = groupInboxData.groups
        .map((group) => {
            const groupId = group.id.toString();
            const isActive = activeGroupId === groupId && currentChatType === 'groups';

            return `
                <div class="inbox-item ${isActive ? 'active' : ''}" data-group-id="${groupId}">
                    <div class="chat-avatar group-avatar">${escapeHtml(groupInitials(group.name))}</div>
                    <div class="inbox-details">
                        <div style="display:flex;justify-content:space-between;gap:8px;">
                            <strong>${escapeHtml(group.name)}</strong>
                        </div>
                        <p>${escapeHtml(group.category)} • ${group.memberCount} members</p>
                    </div>
                </div>
            `;
        })
        .join('');

    document.querySelectorAll('#group-inbox-list .inbox-item').forEach((item) => {
        item.addEventListener('click', () => {
            showGroupChat(item.getAttribute('data-group-id'));
        });
    });

    lucide.createIcons();
}

/* =========================================
   SHOW THERAPIST CONVERSATION
========================================= */
async function showConversation(therapistId, scrollToView = false, type = 'therapist') {
    activeTherapistId = therapistId;
    currentChatType = 'therapists';

    const conversation = therapistInboxData.conversations.find(
        (entry) => entry.therapistId.toString() === therapistId.toString()
    );

    if (!conversation) return;

    // Update header
    document.getElementById('chat-avatar').textContent = therapistInitials(conversation.therapistName);
    document.getElementById('chat-therapist-name').textContent = conversation.therapistName;
    document.getElementById('chat-therapist-meta').textContent = 'Therapist';

    // Render messages with WhatsApp-style styling
    const token = getToken();
    if (!token) return;

    try {
        const response = await fetch(
            `${API_BASE}/messages/therapist/${therapistId}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = await parseApiResponse(response);
        if (!response.ok) {
            if (handleAuthError(response.status, data.message)) return;
            throw new Error(data.message || 'Could not load conversation.');
        }

        renderTherapistChat(data.messages || []);

        // Mark as read
        if (!markingRead) {
            markingRead = true;
            try {
                await fetch(
                    `${API_BASE}/messages/therapist/${therapistId}/mark-read`,
                    { method: 'POST', headers: { Authorization: `Bearer ${token}` } }
                );
            } catch (error) {
                console.error('Error marking messages as read:', error);
            }
            markingRead = false;
        }

        // Enable input
        document.getElementById('user-reply-input').disabled = false;
        document.getElementById('user-reply-send').disabled = false;

        // Update inbox
        renderTherapistInboxList();

        if (scrollToView) {
            document.getElementById('therapist-inbox-list')
                .querySelector(`[data-therapist-id="${therapistId}"]`)
                ?.scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        console.error('Error showing conversation:', error);
    }
}

/* =========================================
   RENDER THERAPIST CHAT (With styling)
========================================= */
function renderTherapistChat(messages) {
    const chatHistory = document.getElementById('chat-history');
    if (!chatHistory) return;

    if (!messages.length) {
        chatHistory.innerHTML = '<p class="empty-state">No messages yet. Start the conversation.</p>';
        return;
    }

    const userId = authStorage.get('userId');
    chatHistory.innerHTML = messages
        .map((message) => {
            const isUserMessage = message.senderId.toString() === userId;
            const messageClass = isUserMessage ? 'user-message' : 'therapist-message';

            return `
                <div class="message-group ${messageClass}">
                    <div class="message-content">
                        <p class="message-text">${escapeHtml(message.content)}</p>
                        <span class="message-time">${formatTime(message.createdAt)}</span>
                    </div>
                </div>
            `;
        })
        .join('');

    chatHistory.scrollTop = chatHistory.scrollHeight;
}

/* =========================================
   SHOW GROUP CHAT
========================================= */
async function showGroupChat(groupId) {
    activeGroupId = groupId;
    currentChatType = 'groups';

    const group = groupInboxData.groups.find(
        (g) => g.id.toString() === groupId.toString()
    );

    if (!group) return;

    // Update header
    document.getElementById('chat-avatar').textContent = groupInitials(group.name);
    document.getElementById('chat-therapist-name').textContent = group.name;
    document.getElementById('chat-therapist-meta').textContent = `${group.category} • ${group.memberCount} members`;

    const token = getToken();
    if (!token) return;

    try {
        const response = await fetch(
            `${API_BASE}/groups/${groupId}/messages`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = await parseApiResponse(response);
        if (!response.ok) {
            if (handleAuthError(response.status, data.message)) return;
            throw new Error(data.message || 'Could not load group messages.');
        }

        renderGroupChat(data.messages || []);

        // Enable input
        document.getElementById('user-reply-input').disabled = false;
        document.getElementById('user-reply-send').disabled = false;

        // Update inbox
        renderGroupInboxList();
    } catch (error) {
        console.error('Error showing group chat:', error);
    }
}

/* =========================================
   RENDER GROUP CHAT (WhatsApp style)
========================================= */
function renderGroupChat(messages) {
    const chatHistory = document.getElementById('chat-history');
    if (!chatHistory) return;

    if (!messages.length) {
        chatHistory.innerHTML = '<p class="empty-state">No messages yet. Be the first to share!</p>';
        return;
    }

    const userId = authStorage.get('userId');
    const userName = localStorage.getItem('userIdentifier') || 'You';

    chatHistory.innerHTML = messages
        .map((message) => {
            const isUserMessage = message.senderId?.toString() === userId;
            const messageClass = isUserMessage ? 'user-message' : 'other-message';
            const displayName = isUserMessage ? 'You' : escapeHtml(message.senderName || 'Member');

            return `
                <div class="message-group ${messageClass}">
                    ${!isUserMessage ? `<div class="message-sender">${displayName}</div>` : ''}
                    <div class="message-content">
                        <p class="message-text">${escapeHtml(message.message || message.content)}</p>
                        <span class="message-time">${formatTime(message.createdAt)}</span>
                    </div>
                </div>
            `;
        })
        .join('');

    chatHistory.scrollTop = chatHistory.scrollHeight;
}

/* =========================================
   SEND MESSAGE
========================================= */
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('user-reply-input');
    const sendBtn = document.getElementById('user-reply-send');

    sendBtn.addEventListener('click', () => sendMessage());
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
});

async function sendMessage() {
    const input = document.getElementById('user-reply-input');
    const text = input.value.trim();

    if (!text) return;

    const token = getToken();
    if (!token) return;

    try {
        if (currentChatType === 'therapists' && activeTherapistId) {
            await fetch(
                `${API_BASE}/messages/therapist/${activeTherapistId}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ content: text })
                }
            );
        } else if (currentChatType === 'groups' && activeGroupId) {
            await fetch(
                `${API_BASE}/groups/${activeGroupId}/messages`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ message: text })
                }
            );
        }

        input.value = '';

        // Reload chat
        if (currentChatType === 'therapists') {
            await showConversation(activeTherapistId, false);
        } else {
            await showGroupChat(activeGroupId);
        }
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
    }
}

    chatHistory.innerHTML = conversation.messages
        .map((msg) => {
            const isOutgoing = msg.senderRole !== 'therapist';
            return `
                <div class="bubble ${isOutgoing ? 'outgoing' : 'incoming'}">
                    <p>${escapeHtml(msg.content)}</p>
                    <span class="time">${formatTime(msg.createdAt)}</span>
                </div>
            `;
        })
        .join('');

    chatHistory.scrollTop = chatHistory.scrollHeight;
}

function showConversation(therapistId, markRead) {
    const chatHistory = document.getElementById('chat-history');
    const chatName = document.getElementById('chat-therapist-name');
    const chatMeta = document.getElementById('chat-therapist-meta');
    const chatAvatar = document.getElementById('chat-avatar');
    const replyInput = document.getElementById('user-reply-input');
    const replySend = document.getElementById('user-reply-send');

    if (!therapistId) {
        activeTherapistId = null;
        if (replyInput) replyInput.disabled = true;
        if (replySend) replySend.disabled = true;
        return;
    }

    const conversation = getConversation(therapistId);
    if (!conversation) return;

    activeTherapistId = therapistId;

    document.querySelectorAll('.inbox-item').forEach((item) => {
        item.classList.toggle('active', item.getAttribute('data-therapist-id') === therapistId);
    });

    if (chatName) chatName.textContent = conversation.therapistName;
    if (chatMeta) chatMeta.textContent = 'Your private conversation';
    if (chatAvatar) chatAvatar.textContent = therapistInitials(conversation.therapistName);
    if (replyInput) {
        replyInput.disabled = false;
        replyInput.value = '';
    }
    if (replySend) replySend.disabled = false;

    renderChat(conversation);

    if (markRead) {
        markConversationRead(therapistId);
    }
}

async function markConversationRead(therapistId) {
    if (markingRead) return;

    const conversation = getConversation(therapistId);
    if (!conversation || conversation.unreadCount === 0) return;

    const token = getToken();
    if (!token) return;

    markingRead = true;

    try {
        const response = await fetch(`${API_BASE}/messages/user-read`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ therapistId })
        });

        if (!response.ok) return;

        conversation.unreadCount = 0;
        conversation.messages.forEach((msg) => {
            if (msg.senderRole === 'therapist') msg.read = true;
        });
        inboxData.unreadTotal = inboxData.conversations.reduce(
            (sum, c) => sum + c.unreadCount,
            0
        );
        renderInboxList();
    } catch (error) {
        console.error('Could not mark as read:', error);
    } finally {
        markingRead = false;
    }
}

async function sendUserMessage() {
    const token = getToken();
    const replyInput = document.getElementById('user-reply-input');
    const replySend = document.getElementById('user-reply-send');

    if (!token || !replyInput) return;

    if (!activeTherapistId) {
        alert('Select a therapist conversation on the left before sending.');
        return;
    }

    const content = replyInput.value.trim();
    if (!content) {
        replyInput.focus();
        return;
    }

    if (replySend) replySend.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                therapistId: String(activeTherapistId),
                content
            })
        });

        const data = await parseApiResponse(response);
        if (!response.ok) {
            if (handleAuthError(response.status, data.message)) return;
            alert(data.message || 'Could not send message.');
            return;
        }

        const conversation = getConversation(activeTherapistId);
        if (conversation) {
            conversation.messages.push(data.data);
            conversation.lastMessage = data.data;
            renderChat(conversation);
            renderInboxList();
        } else {
            await loadInbox();
        }

        replyInput.value = '';
    } catch (error) {
        console.error(error);
        alert('Could not connect to the server.');
    } finally {
        if (replySend) replySend.disabled = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const replyInput = document.getElementById('user-reply-input');
    const replySend = document.getElementById('user-reply-send');

    if (replyInput) {
        replyInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendUserMessage();
            }
        });
    }

    if (replySend) {
        replySend.addEventListener('click', sendUserMessage);
    }

    loadInbox().catch((error) => {
        console.error(error);
        const status = document.getElementById('inbox-status');
        if (status) {
            status.textContent = error.message || 'Could not load messages.';
        }
    });
});
