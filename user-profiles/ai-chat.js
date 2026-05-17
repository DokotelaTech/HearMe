const aiChatBox = document.getElementById('aiChatBox');
const aiUserInput = document.getElementById('aiUserInput');
const aiSendBtn = document.getElementById('aiSendBtn');

// 1. Add User Message to Screen
function appendUserMessage(text) {
    const wrapper = document.createElement('div');
    wrapper.className = 'user-message-wrapper';
    wrapper.innerHTML = `<div class="user-bubble">${text}</div>`;
    aiChatBox.appendChild(wrapper);
    aiChatBox.scrollTop = aiChatBox.scrollHeight;
}

// 2. Add AI Message to Screen
function appendAIMessage(text) {
    const wrapper = document.createElement('div');
    wrapper.className = 'ai-message-wrapper';
    // Fixed: Using 'ai-avatar-circle' to match your CSS perfectly
    wrapper.innerHTML = `
        <div class="ai-avatar-circle">🤖</div>
        <div class="ai-bubble">${text}</div>
    `;
    aiChatBox.appendChild(wrapper);
    aiChatBox.scrollTop = aiChatBox.scrollHeight;
}
// 3. Connect to your secure Node.js backend
async function fetchAIResponse(userText) {
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
        // ⚠️ CRITICAL: Retrieve the token saved during login
        // Make sure 'token' matches exactly what you called it when saving it to localStorage!
        const token = localStorage.getItem('token'); 

        const response = await fetch('http://localhost:5000/api/chat', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // <--- Sending the token to pass verifyToken
            },
            body: JSON.stringify({ message: userText })
        });
        
        // If the server throws an error (like 401 Unauthorized)
        if (!response.ok) {
            throw new Error(`Server rejected the request: ${response.status}`);
        }

        const data = await response.json();
        
        // Remove typing indicator once response arrives
        const typingElement = document.getElementById(typingId);
        if (typingElement) typingElement.remove();

        if (data.candidates && data.candidates.length > 0) {
            appendAIMessage(data.candidates[0].content.parts[0].text);
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