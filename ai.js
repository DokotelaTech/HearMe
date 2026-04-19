// Replace with your actual key for local testing. 
// DO NOT push this key to GitHub or a public server!
const API_KEY = '{YOUR_API_KEY}';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const breatheBtn = document.getElementById('breathe-btn');

// System prompt to enforce the HearMe personality
const systemInstruction = "You are HearMe, an anonymous, compassionate AI listener. Your goal is to provide a safe, non-judgmental space for users. Keep your responses concise, empathetic, and always end by gently guiding the conversation forward or asking how they feel.";

// Function to add a new message bubble to the DOM
function addMessageToUI(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(sender === 'user' ? 'user-message' : 'ai-message');
    messageDiv.textContent = text;
    chatBox.appendChild(messageDiv);
    
    // Scroll to the bottom
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Function to call the Gemini API
async function generateAIResponse(userMessage) {
    // Show a temporary typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('message', 'ai-message');
    typingIndicator.id = 'typing-indicator';
    typingIndicator.textContent = 'HearMe is typing...';
    chatBox.appendChild(typingIndicator);
    chatBox.scrollTop = chatBox.scrollHeight;

    // The payload structure required by Google AI Studio
    const requestBody = {
        contents: [
            {
                role: "user",
                parts: [{ text: `${systemInstruction}\n\nUser says: ${userMessage}` }]
            }
        ],
        generationConfig: {
            temperature: 0.7, // Slightly creative but grounded
        }
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        
        // Remove typing indicator
        document.getElementById('typing-indicator').remove();

        if (data.candidates && data.candidates.length > 0) {
            const aiText = data.candidates[0].content.parts[0].text;
            addMessageToUI(aiText, 'ai');
        } else {
            addMessageToUI("I'm having a little trouble connecting right now, but I'm still here.", 'ai');
        }

    } catch (error) {
        console.error("Error fetching from API:", error);
        document.getElementById('typing-indicator').remove();
        addMessageToUI("An error occurred. Please try again.", 'ai');
    }
}

// Event Listeners
sendBtn.addEventListener('click', () => {
    const text = userInput.value.trim();
    if (text) {
        addMessageToUI(text, 'user');
        userInput.value = '';
        generateAIResponse(text);
    }
});

// Allow hitting "Enter" to send
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendBtn.click();
    }
});

// Simple interaction for the Breathe button
breatheBtn.addEventListener('click', () => {
    addMessageToUI("Let's take a slow, deep breath together. Inhale... and exhale...", 'ai');
});