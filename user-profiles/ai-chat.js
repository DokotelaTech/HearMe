<<<<<<< HEAD
// Fixed: Grabbing the element by class to match your polished CSS layout
localStorage.clear();

const aiChatBox = document.querySelector('.chat-display'); 
=======
const aiChatBox = document.getElementById('aiChatBox');
>>>>>>> 8bfd832 (project)
const aiUserInput = document.getElementById('aiUserInput');
const aiSendBtn = document.getElementById('aiSendBtn');

// 1. Add User Message to Screen
function appendUserMessage(text) {
<<<<<<< HEAD
    if (!aiChatBox) return;
=======
>>>>>>> 8bfd832 (project)
    const wrapper = document.createElement('div');
    wrapper.className = 'user-message-wrapper';
    wrapper.innerHTML = `<div class="user-bubble">${text}</div>`;
    aiChatBox.appendChild(wrapper);
    aiChatBox.scrollTop = aiChatBox.scrollHeight;
}

// 2. Add AI Message to Screen
function appendAIMessage(text) {
<<<<<<< HEAD
    if (!aiChatBox) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'ai-message-wrapper';
=======
    const wrapper = document.createElement('div');
    wrapper.className = 'ai-message-wrapper';
    // Fixed: Using 'ai-avatar-circle' to match your CSS perfectly
>>>>>>> 8bfd832 (project)
    wrapper.innerHTML = `
        <div class="ai-avatar-circle">🤖</div>
        <div class="ai-bubble">${text}</div>
    `;
    aiChatBox.appendChild(wrapper);
    aiChatBox.scrollTop = aiChatBox.scrollHeight;
}
<<<<<<< HEAD

// 3. Connect to your secure Node.js backend
async function fetchAIResponse(userText) {
    if (!aiChatBox) return;

=======
// 3. Connect to your secure Node.js backend
async function fetchAIResponse(userText) {
>>>>>>> 8bfd832 (project)
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
<<<<<<< HEAD
=======
        // ⚠️ CRITICAL: Retrieve the token saved during login
        // Make sure 'token' matches exactly what you called it when saving it to localStorage!
>>>>>>> 8bfd832 (project)
        const token = localStorage.getItem('token'); 

        const response = await fetch('http://localhost:5000/api/chat', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
<<<<<<< HEAD
                'Authorization': `Bearer ${token}`
=======
                'Authorization': `Bearer ${token}` // <--- Sending the token to pass verifyToken
>>>>>>> 8bfd832 (project)
            },
            body: JSON.stringify({ message: userText })
        });
        
<<<<<<< HEAD
=======
        // If the server throws an error (like 401 Unauthorized)
>>>>>>> 8bfd832 (project)
        if (!response.ok) {
            throw new Error(`Server rejected the request: ${response.status}`);
        }

        const data = await response.json();
        
        // Remove typing indicator once response arrives
        const typingElement = document.getElementById(typingId);
        if (typingElement) typingElement.remove();

<<<<<<< HEAD
        // Standard response paths (Handling both deep nested text object and flat strings)
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            appendAIMessage(data.candidates[0].content.parts[0].text);
        } else if (data.reply) { 
            // Fallback: in case your backend passes back a clean simplified string property like { reply: "..." }
            appendAIMessage(data.reply);
=======
        if (data.candidates && data.candidates.length > 0) {
            appendAIMessage(data.candidates[0].content.parts[0].text);
>>>>>>> 8bfd832 (project)
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
<<<<<<< HEAD
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
=======
>>>>>>> 8bfd832 (project)
});