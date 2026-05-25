/**
 * HearMe - Messages Module Functional Logic
 * Handles automatic scrolling, real-time message submission, and DOM construction.
 */
document.addEventListener('DOMContentLoaded', () => {
// 1. DOM Element Registrations
const chatForm = document.getElementById('chatInputForm');
const inputField = document.getElementById('msgInputField');
const historyWindow = document.getElementById('chatHistoryWindow');
const convoItems = document.querySelectorAll('.convo-item');

// 2. Initial Setup: Snap message viewport to the latest messages at the bottom
if (historyWindow) {
historyWindow.scrollTop = historyWindow.scrollHeight;
}

// 3. Handle Message Submission Pipeline
if (chatForm && inputField && historyWindow) {
chatForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Stop standard HTML form page reloads

    const messageText = inputField.value.trim();
    if (messageText === '') return; // Guard clause against empty messages

    // Create Outgoing Bubble Structural Nodes
    const bubbleWrapper = document.createElement('div');
    bubbleWrapper.classList.add('msg-bubble-wrapper', 'outgoing');

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('bubble-content');
    contentDiv.textContent = messageText;

    const timeStampSpan = document.createElement('span');
    timeStampSpan.classList.add('bubble-meta-time');
    timeStampSpan.textContent = 'Just now';

    // Stitch elements together into the DOM tree
    bubbleWrapper.appendChild(contentDiv);
    bubbleWrapper.appendChild(timeStampSpan);
    historyWindow.appendChild(bubbleWrapper);

    // Reset input focus field state
    inputField.value = '';

    // Perform smooth layout adjustment down to the new message entry
    historyWindow.scrollTo({
        top: historyWindow.scrollHeight,
        behavior: 'smooth'
    });
});
}

// 4. Interactivity: Switching Active Sidebar Conversations (Optional Helper)
convoItems.forEach(item => {
item.addEventListener('click', () => {
    convoItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    
    // Clear unread notification indicator dot if clicked
    const badge = item.querySelector('.unread-indicator');
    if (badge) {
        badge.style.display = 'none';
    }
});
});
});