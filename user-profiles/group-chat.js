const socket = io('http://localhost:5000');
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const groupName = localStorage.getItem('activeGroup');
const userIdentifier = localStorage.getItem('userIdentifier');

document.getElementById('group-title').innerText = groupName;

// Join the specific group room
socket.emit('joinRoom', { groupName, userIdentifier });

// Listen for incoming messages
socket.on('message', (data) => {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<strong>${data.user}:</strong> ${data.text}`;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll
});

// Send message
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = document.getElementById('message-input').value;
    socket.emit('chatMessage', { groupName, user: userIdentifier, text });
    document.getElementById('message-input').value = '';
});