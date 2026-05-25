const API = 'http://localhost:5000/api';

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m    = Math.floor(diff / 60000);
    if (m < 1)  return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

function initials(name) {
    return (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function getToken() { return localStorage.getItem('token'); }

function getMyName() {
    try {
        const uRaw = localStorage.getItem('user');
        const u = JSON.parse(uRaw);
        const ident = u?.identifier;
        console.log('[messages.getMyName] localStorage.user=', u);
        if (ident) return ident.toLowerCase().trim();
    } catch (e) {
        console.log('[messages.getMyName] could not parse localStorage.user', e);
    }
    const idRaw = localStorage.getItem('userIdentifier');
    console.log('[messages.getMyName] localStorage.userIdentifier=', idRaw);
    if (idRaw) return idRaw.toLowerCase().trim();
    return null;
}


function authHeaders() {
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` };
}

if (!getToken()) window.location.href = '../landing-page/login.html';

let allMessages  = [];
let threads      = {};
let activeExpert = null;

const inboxList   = document.getElementById('inboxList');
const chatPanel   = document.getElementById('chatPanel');
const searchInput = document.getElementById('inboxSearch');

// ── fetch using dedicated inbox endpoint ──────────────────────
async function fetchMessages() {
    const myName = getMyName();
    inboxList.innerHTML = `<div class="loading-state">Loading messages...</div>`;

    if (!myName) {
        inboxList.innerHTML = `
            <div class="inbox-empty">
                <p style="color:#ef4444;padding:20px;text-align:center;">
                    Could not identify user. Please log out and log back in.
                </p>
            </div>`;
        return;
    }

    try {
        // Use the dedicated inbox route that filters by sender
        const r = await fetch(`${API}/messages/inbox?sender=${encodeURIComponent(myName)}`,
            { headers: authHeaders() });
        if (!r.ok) throw new Error('Server error');
        allMessages = await r.json();
        groupAndRender();
    } catch (err) {
        console.error(err);
        inboxList.innerHTML = `
            <div class="inbox-empty">
                <p style="color:#ef4444;padding:20px;text-align:center;">
                    Could not load messages. Is the server running?
                </p>
            </div>`;
    }
}

function groupAndRender(filter = '') {
    threads = {};
    allMessages.forEach(msg => {
        const key = msg.expert_name || 'Unknown';
        if (!threads[key]) threads[key] = [];
        threads[key].push(msg);
    });
    Object.values(threads).forEach(t =>
        t.sort((a, b) => new Date(a.sent_at) - new Date(b.sent_at))
    );
    const keys = Object.keys(threads).filter(k =>
        !filter || k.toLowerCase().includes(filter)
    );
    renderInboxList(keys);
}

function renderInboxList(expertKeys) {
    if (!expertKeys.length) {
        inboxList.innerHTML = `
            <div class="inbox-empty">
                <i data-lucide="mail-open"></i>
                <p>No messages yet.<br>Contact an expert to start a conversation.</p>
            </div>`;
        lucide.createIcons();
        return;
    }

    inboxList.innerHTML = expertKeys.map(expert => {
        const msgs  = threads[expert];
        const last  = msgs[msgs.length - 1];

        // last activity = latest reply if any, else message time
        const lastReply   = last.replies && last.replies.length
            ? last.replies[last.replies.length - 1]
            : null;
        const lastTime    = lastReply ? lastReply.sent_at : last.sent_at;
        const lastText    = lastReply ? `${lastReply.therapist_name}: ${lastReply.text}` : last.message;
        const preview     = lastText.length > 45 ? lastText.slice(0, 45) + '...' : lastText;
        const hasNewReply = lastReply != null;
        const isActive    = expert === activeExpert;

        return `
        <div class="inbox-item ${isActive ? 'active' : ''} ${hasNewReply ? 'unread' : ''}"
             data-expert="${encodeURIComponent(expert)}">
            <div class="inbox-avatar">${initials(expert)}</div>
            <div class="inbox-info">
                <div class="inbox-row">
                    <span class="inbox-name ${hasNewReply ? 'bold' : ''}">${expert}</span>
                    <span class="inbox-time">${timeAgo(lastTime)}</span>
                </div>
                <div class="inbox-preview ${hasNewReply ? 'bold' : ''}">${preview}</div>
            </div>
            ${hasNewReply ? '<span class="unread-dot"></span>' : ''}
        </div>`;
    }).join('');

    lucide.createIcons();
    inboxList.querySelectorAll('.inbox-item').forEach(item => {
        item.addEventListener('click', () => openThread(decodeURIComponent(item.dataset.expert)));
    });
}

function openThread(expertName) {
    activeExpert = expertName;
    const msgs   = threads[expertName] || [];
    groupAndRender(searchInput.value.toLowerCase());

    // Build all bubbles: user messages (right) + therapist replies (left)
    let bubblesHTML = '';
    msgs.forEach(msg => {
        // User's original message — right side (mine)
        bubblesHTML += `
            <div class="bubble-wrap mine">
                <div class="bubble mine">${msg.message}</div>
                <span class="bubble-time" style="text-align:right;">${timeAgo(msg.sent_at)}</span>
            </div>`;

        // Therapist replies — left side (theirs)
        if (msg.replies && msg.replies.length) {
            msg.replies.forEach(reply => {
                bubblesHTML += `
                    <div class="bubble-wrap theirs">
                        <div class="bubble theirs">${reply.text}</div>
                        <span class="bubble-time">${reply.therapist_name} · ${timeAgo(reply.sent_at)}</span>
                    </div>`;
            });
        }
    });

    chatPanel.innerHTML = `
        <div class="chat-header">
            <div class="chat-header-avatar">${initials(expertName)}</div>
            <div class="chat-header-info">
                <strong>${expertName}</strong>
                <span>Therapist / Expert</span>
            </div>
        </div>

        <div class="chat-body" id="chatBody">
            <div class="request-badge">
                <span>Your conversation with ${expertName}</span>
            </div>
            ${bubblesHTML}
        </div>

        <div class="chat-footer">
            <div class="chat-footer-note">
                Your therapist will reply within 24 hours.
            </div>
            <div class="reply-row">
                <input type="text" id="replyInput" placeholder="Send a follow-up message..." />
                <button class="send-btn" id="sendBtn">
                    <i data-lucide="send"></i> Send
                </button>
            </div>
        </div>
    `;

    lucide.createIcons();

    const body = document.getElementById('chatBody');
    body.scrollTop = body.scrollHeight;

    const sendBtn    = document.getElementById('sendBtn');
    const replyInput = document.getElementById('replyInput');

    const doSend = async () => {
        const text = replyInput.value.trim();
        if (!text) return;
        sendBtn.disabled    = true;
        replyInput.disabled = true;

        try {
            const myName = getMyName() || 'User';
            const r = await fetch(`${API}/messages`, {
                method:  'POST',
                headers: authHeaders(),
                body:    JSON.stringify({ expert_name: expertName, sender_name: myName, message: text })
            });
            if (!r.ok) throw new Error();

            const newBubble = document.createElement('div');
            newBubble.className = 'bubble-wrap mine';
            newBubble.innerHTML = `
                <div class="bubble mine">${text}</div>
                <span class="bubble-time" style="text-align:right;">Just now</span>`;
            body.appendChild(newBubble);
            body.scrollTop = body.scrollHeight;
            replyInput.value = '';

            allMessages.push({
                expert_name: expertName,
                sender_name: myName,
                message:     text,
                is_read:     false,
                sent_at:     new Date().toISOString(),
                replies:     []
            });
        } catch {
            alert('Could not send message. Please try again.');
        } finally {
            sendBtn.disabled    = false;
            replyInput.disabled = false;
            replyInput.focus();
        }
    };

    sendBtn.addEventListener('click', doSend);
    replyInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSend(); });
}

searchInput.addEventListener('input', e => groupAndRender(e.target.value.toLowerCase()));

// ── avatar / dropdown ─────────────────────────────────────────
const avatar   = document.getElementById('user-avatar-main');
const dropdown = document.getElementById('user-dropdown');
if (avatar && dropdown) {
    const name = getMyName();
    if (name) avatar.textContent = name[0].toUpperCase();
    avatar.addEventListener('click', () => {
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    });
    document.addEventListener('click', e => {
        if (!avatar.contains(e.target) && !dropdown.contains(e.target))
            dropdown.style.display = 'none';
    });
}

document.getElementById('logout-btn')?.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '../landing-page/login.html';
});

lucide.createIcons();
fetchMessages();

// refresh every 30s so new replies appear automatically
setInterval(fetchMessages, 30000);