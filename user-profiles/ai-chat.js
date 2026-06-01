// Fixed: Grabbing the element by class to match your polished CSS layout
// localStorage.clear();

const aiChatBox = document.querySelector('.chat-display'); 
const aiUserInput = document.getElementById('aiUserInput');
const aiSendBtn = document.getElementById('aiSendBtn');

// 1. Add User Message to Screen
function appendUserMessage(text) {
    if (!aiChatBox) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'user-message-wrapper';
    wrapper.innerHTML = `<div class="user-bubble">${text}</div>`;
    aiChatBox.appendChild(wrapper);
    aiChatBox.scrollTop = aiChatBox.scrollHeight;
}

// 2. Add AI Message to Screen
function appendAIMessage(text) {
    if (!aiChatBox) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'ai-message-wrapper';
    wrapper.innerHTML = `
        <div class="ai-avatar-circle">🤖</div>
        <div class="ai-bubble">${text}</div>
    `;
    aiChatBox.appendChild(wrapper);
    aiChatBox.scrollTop = aiChatBox.scrollHeight;
}

// 3. Connect to your secure Node.js backend
async function fetchAIResponse(userText) {
    if (!aiChatBox) return;

    // Show a typing indicator while waiting
    const typingId = 'typing-' + Date.now();
    const typingWrapper = document.createElement('div');
    typingWrapper.className = 'ai-message-wrapper';
    typingWrapper.id = typingId;
    typingWrapper.innerHTML = `
        <div class="ai-avatar-circle">🤖</div>
        <div class="ai-bubble">...</div>
    `;
    aiChatBox.appendChild(typingWrapper);
    aiChatBox.scrollTop = aiChatBox.scrollHeight;

    try {
        const token = localStorage.getItem('token'); 

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ message: userText })
        });
        
        if (!response.ok) {
            throw new Error(`Server rejected the request: ${response.status}`);
        }

        const data = await response.json();
        
        // Remove typing indicator once response arrives
        const typingElement = document.getElementById(typingId);
        if (typingElement) typingElement.remove();

        // Standard response paths (Handling both deep nested text object and flat strings)
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            appendAIMessage(data.candidates[0].content.parts[0].text);
        } else if (data.reply) { 
            // Fallback: in case your backend passes back a clean simplified string property like { reply: "..." }
            appendAIMessage(data.reply);
        } else {
            appendAIMessage("I'm having a little trouble connecting, but I'm here for you.");
        }
    } catch (error) {
        console.error("AI Error:", error);
        const typingElement = document.getElementById(typingId);
        if (typingElement) typingElement.remove();
        
        appendAIMessage("Connection error. Please make sure you are logged in.");
    }
}

// 4. Button Click Event
aiSendBtn.addEventListener('click', () => {
    const text = aiUserInput.value.trim();
    if (text) {
        appendUserMessage(text);
        aiUserInput.value = '';
        fetchAIResponse(text);
    }
});

// 5. Enter Key Event
aiUserInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        aiSendBtn.click();
    }
});
document.addEventListener('DOMContentLoaded', () => {
    const trigger = document.getElementById('dropdownTrigger');
    const menu = document.getElementById('dropdownMenu');

    if (trigger && menu) {
        // Toggle menu view when clicking the profile element
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('show');
        });

        // Close menu dynamically if the user clicks anywhere else outside of it
        document.addEventListener('click', (e) => {
            if (!trigger.contains(e.target) && !menu.contains(e.target)) {
                menu.classList.remove('show');
            }
        });
    }
});