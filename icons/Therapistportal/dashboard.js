// 1. Data Structure
const clients = [
    {
        id: "User#2931",
        firstContact: "Mar 15, 2026",
        sessions: 8,
        tags: ["Work Stress", "Anxiety", "Sleep Issues"],
        latestNote: "Making good progress with CBT techniques. Recommended daily journaling.",
        lastSession: "Apr 23, 2026",
        unreadMessages: 2,
        status: "active",
        color: "yellow"
    },
    {
        id: "User#5847",
        firstContact: "Feb 10, 2026",
        sessions: 12,
        tags: ["Social Anxiety", "Self-Esteem"],
        latestNote: "Excellent progress. Recently joined support group and reported positive experiences.",
        lastSession: "Apr 22, 2026",
        unreadMessages: 0,
        status: "active",
        color: "green"
    },
    {
        id: "User#1102",
        firstContact: "Jan 05, 2026",
        sessions: 4,
        tags: ["Depression"],
        latestNote: "Client missed last appointment. Follow-up required.",
        lastSession: "Mar 12, 2026",
        unreadMessages: 0,
        status: "pending",
        color: "green"
    }
];

// 2. Core Rendering Function
function renderClients(filterStatus = 'all', searchTerm = '') {
    const container = document.getElementById('client-container');
    
    // Filtering logic
    const filtered = clients.filter(c => {
        const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
        const matchesSearch = c.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              c.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesStatus && matchesSearch;
    });

    if (filtered.length === 0) {
        container.innerHTML = `<p style="padding: 20px; color: #64748b;">No clients found matching your criteria.</p>`;
        return;
    }

    container.innerHTML = filtered.map(client => `
        <div class="client-card ${client.color === 'green' ? 'green' : ''}">
            <div class="card-header">
                <div class="client-meta">
                    <div class="c-avatar">${client.id.split('#')[1].substring(0,2)}</div>
                    <div class="c-info">
                        <h4>${client.id}</h4>
                        <span>First contact: ${client.firstContact} • ${client.sessions} sessions</span>
                    </div>
                </div>
                <div class="badge-status">${client.status}</div>
            </div>

            <div class="tags">
                ${client.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>

            <div class="notes-preview">
                <strong>Latest notes:</strong> ${client.latestNote}
            </div>

            <div class="card-footer">
                <div class="last-session">
                    <i class="fa-regular fa-calendar"></i> Last session: ${client.lastSession}
                    ${client.unreadMessages > 0 ? `
                        <a href="#" class="msg-link" onclick="handleAction('messaging', '${client.id}')">
                            <i class="fa-regular fa-message"></i> ${client.unreadMessages} new messages
                        </a>` : ''}
                </div>
                <div class="card-actions">
                    <button class="btn-primary" onclick="handleAction('Message', '${client.id}')">
                        <i class="fa-regular fa-message"></i> Message Client
                    </button>
                    <button class="btn-outline" onclick="handleAction('Schedule', '${client.id}')">
                        <i class="fa-regular fa-calendar"></i> Schedule Session
                    </button>
                    <button class="btn-outline" onclick="handleAction('Notes', '${client.id}')">
                        <i class="fa-regular fa-file-lines"></i> View Notes
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// 3. Functional Handlers
function handleAction(actionType, clientId) {
    // This mimics opening a modal or navigating to a new page
    alert(`${actionType} action triggered for ${clientId}`);
}

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('.search-input input');
    const filterBtns = document.querySelectorAll('.f-btn');

    // Search Functionality
    searchInput.addEventListener('input', (e) => {
        const activeBtn = document.querySelector('.f-btn.active');
        renderClients(activeBtn.innerText.toLowerCase(), e.target.value);
    });

    // Filter Button Functionality
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update UI
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Render filtered data
            const status = btn.innerText.toLowerCase();
            renderClients(status, searchInput.value);
        });
    });

    // Initial Render
    renderClients();
});