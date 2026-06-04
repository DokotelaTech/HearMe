// ============================================================
//  HearMe — AI Support Chat
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

    // ── Element references ──────────────────────────────────
    const aiChatBox   = document.querySelector('.chat-display');
    const aiUserInput = document.getElementById('aiUserInput');
    const aiSendBtn   = document.getElementById('aiSendBtn');

    // Guard: if core elements are missing, stop quietly
    if (!aiChatBox || !aiUserInput || !aiSendBtn) {
        console.warn('AI Chat: required elements not found in DOM.');
        return;
    }

    // ── 1. Append user message ──────────────────────────────
    function appendUserMessage(text) {
        const wrapper = document.createElement('div');
        wrapper.className = 'user-message-wrapper';
        wrapper.innerHTML = `<div class="user-bubble">${escapeHTML(text)}</div>`;
        aiChatBox.appendChild(wrapper);
        scrollToBottom();
    }

    // ── 2. Append AI message ────────────────────────────────
    function appendAIMessage(text) {
        const wrapper = document.createElement('div');
        wrapper.className = 'ai-message-wrapper';
        wrapper.innerHTML = `
            <div class="ai-avatar-circle">🤖</div>
            <div class="ai-bubble">${text}</div>
        `;
        aiChatBox.appendChild(wrapper);
        scrollToBottom();
    }

    // ── 3. Show / remove typing indicator ──────────────────
    function showTyping() {
        const id = 'typing-' + Date.now();
        const wrapper = document.createElement('div');
        wrapper.className = 'ai-message-wrapper';
        wrapper.id = id;
        wrapper.innerHTML = `
            <div class="ai-avatar-circle">🤖</div>
            <div class="ai-bubble typing-indicator">
                <span></span><span></span><span></span>
            </div>
        `;
        aiChatBox.appendChild(wrapper);
        scrollToBottom();
        return id;
    }

    function removeTyping(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    // ── 4. Fetch AI response from backend ──────────────────
    async function fetchAIResponse(userText) {
        const typingId = showTyping();

        try {
            // Try common token key names — update 'token' to match yours if different
            const token = localStorage.getItem('token')
                       || localStorage.getItem('authToken')
                       || localStorage.getItem('jwt')
                       || '';

            if (!token) {
                removeTyping(typingId);
                appendAIMessage("Please log in to use the AI chat.");
                return;
            }

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: userText })
            });

            removeTyping(typingId);

            if (!response.ok) {
                // Specific messages for common HTTP errors
                if (response.status === 401) {
                    appendAIMessage("Your session has expired. Please log in again.");
                } else if (response.status === 429) {
                    appendAIMessage("Too many messages. Please wait a moment and try again.");
                } else {
                    appendAIMessage(`Something went wrong (error ${response.status}). Please try again.`);
                }
                return;
            }

            const data = await response.json();

            // Handle multiple response shapes from different AI backends
            if (data.reply) {
                // Clean backend shape: { reply: "..." }
                appendAIMessage(data.reply);
            } else if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                // Google Gemini shape
                appendAIMessage(data.candidates[0].content.parts[0].text);
            } else if (data.choices?.[0]?.message?.content) {
                // OpenAI shape
                appendAIMessage(data.choices[0].message.content);
            } else if (data.message) {
                appendAIMessage(data.message);
            } else {
                appendAIMessage("I received a response but couldn't read it. Please try again.");
                console.warn('Unrecognised AI response shape:', data);
            }

        } catch (error) {
            removeTyping(typingId);
            console.error('AI Chat fetch error:', error);

            if (error instanceof TypeError && error.message.includes('fetch')) {
                appendAIMessage("Can't reach the server. Please check your connection.");
            } else {
                appendAIMessage("Something went wrong. Please try again in a moment.");
            }
        }
    }

    // ── 5. Send message ─────────────────────────────────────
    function sendMessage() {
        const text = aiUserInput.value.trim();
        if (!text) return;

        appendUserMessage(text);
        aiUserInput.value = '';
        aiUserInput.focus();
        fetchAIResponse(text);
    }

    // ── 6. Event listeners ──────────────────────────────────
    aiSendBtn.addEventListener('click', sendMessage);

    aiUserInput.addEventListener('keydown', (e) => {
        // Send on Enter, allow Shift+Enter for newlines if textarea
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // ── 7. Profile dropdown (if on this page) ──────────────
    const trigger = document.getElementById('dropdownTrigger');
    const menu    = document.getElementById('dropdownMenu');

    if (trigger && menu) {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!trigger.contains(e.target) && !menu.contains(e.target)) {
                menu.classList.remove('show');
            }
        });
    }

    // ── Helpers ─────────────────────────────────────────────
    function scrollToBottom() {
        aiChatBox.scrollTop = aiChatBox.scrollHeight;
    }

    // Prevent XSS from user-typed content
    function escapeHTML(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

});