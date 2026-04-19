//API IS NOW COMING FROM config.js 
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

const aiChatBox = document.getElementById('aiChatBox');
const aiUserInput = document.getElementById('aiUserInput');
const aiSendBtn = document.getElementById('aiSendBtn');

const systemInstruction = "You are HearMe, an anonymous, compassionate AI listener. Your goal is to provide a safe, non-judgmental space for users. Keep your responses concise, empathetic, and always end by gently guiding the conversation forward or asking how they feel.";

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
    wrapper.innerHTML = `
        <div class="ai-avatar">🤖</div>
        <div class="ai-bubble">${text}</div>
    `;
    aiChatBox.appendChild(wrapper);
    aiChatBox.scrollTop = aiChatBox.scrollHeight;
}

// 3. Connect to Google AI Studio
async function fetchAIResponse(userText) {
    // Show a typing indicator while waiting
    const typingId = 'typing-' + Date.now();
    const typingWrapper = document.createElement('div');
    typingWrapper.className = 'ai-message-wrapper';
    typingWrapper.id = typingId;
    typingWrapper.innerHTML = `
        <div class="ai-avatar">🤖</div>
        <div class="ai-bubble">...</div>
    `;
    aiChatBox.appendChild(typingWrapper);
    aiChatBox.scrollTop = aiChatBox.scrollHeight;

    const requestBody = {
        contents: [{ role: "user", parts: [{ text: `${systemInstruction}\n\nUser says: ${userText}` }] }],
        generationConfig: { temperature: 0.7 }
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        const data = await response.json();
        
        // Remove typing indicator once response arrives
        document.getElementById(typingId).remove();

        if (data.candidates && data.candidates.length > 0) {
            appendAIMessage(data.candidates[0].content.parts[0].text);
        } else {
            appendAIMessage("I'm having a little trouble connecting, but I'm here for you.");
        }
    } catch (error) {
        console.error("AI Error:", error);
        if(document.getElementById(typingId)) {
             document.getElementById(typingId).remove();
        }
        appendAIMessage("Connection error. Please try again.");
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