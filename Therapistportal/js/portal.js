document.addEventListener('DOMContentLoaded', () => {
    
    // Check if we are on the Clients page
    if (document.getElementById('clients-list-container')) {
        fetchAndRenderClients();
    }

    // Check if we are on the Calendar page
    if (document.getElementById('appointments-list-container')) {
        fetchAndRenderAppointments();
    }

    // Check if we are on the Report page
    if (document.getElementById('report-issue-form')) {
        setupReportFormUI();
    }
});

// ==========================================
// CLIENTS PAGE LOGIC
// ==========================================
async function fetchAndRenderClients() {
    try {
        const response = await fetch('/api/therapist/clients'); 
        if (!response.ok) return;
        
        const realClientsData = await response.json();
        const container = document.getElementById('clients-list-container');
        container.innerHTML = ''; 

        realClientsData.forEach(client => {
            let statusBadge = '';
            let highlightClass = '';

            if (client.requestedHelp && client.isOnline) {
                statusBadge = `<span class="status-badge green">ACTIVE - ONLINE</span>`;
                highlightClass = 'highlight-green'; 
            } else if (client.requestedHelp && !client.isOnline) {
                statusBadge = `<span class="status-badge yellow">PENDING REQUEST</span>`;
                highlightClass = 'highlight-yellow';
            } else {
                statusBadge = `<span class="status-badge gray">INACTIVE</span>`;
            }
            
            const tagsHtml = client.issues.map(issue => `<span class="tag blue">${issue}</span>`).join('');
            
            const clientCard = `
                <div class="client-card ${highlightClass}">
                    <div class="c-header">
                        <div class="c-avatar blue">${client.id.substring(0, 2)}</div>
                        <div class="c-title">
                            <h3>User#${client.id}</h3>
                            <span>First contact: ${client.firstContact} • ${client.sessionsCount || 0} sessions</span>
                        </div>
                        ${statusBadge}
                    </div>
                    <div class="c-tags">${tagsHtml}</div>
                    <div class="c-note"><strong>Latest notes:</strong> ${client.latestNote || 'No notes yet.'}</div>
                    <div class="c-footer">
                        <span class="date-info">
                            <i class="fa-regular fa-calendar"></i> Last session: ${client.lastSessionDate || 'N/A'}
                        </span>
                        <div class="actions">
                            <button class="btn-primary"><i class="fa-regular fa-message"></i> Message Client</button>
                            <button class="btn-outline"><i class="fa-regular fa-calendar"></i> Schedule Session</button>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += clientCard;
        });

    } catch (error) {
        console.log("Database not connected yet.");
    }
}

// ==========================================
// REPORT PAGE LOGIC
// ==========================================
function setupReportFormUI() {
    const cards = document.querySelectorAll('.cat-btn');
    const hiddenInput = document.getElementById('report-category-input');

    if (!cards || !hiddenInput) return;

    cards.forEach(card => {
        card.addEventListener('click', function() {
            cards.forEach(c => {
                c.classList.remove('active');
                c.style.backgroundColor = 'white';
                c.style.borderColor = '#e5e7eb';
            });
            this.classList.add('active');
            this.style.backgroundColor = '#eff6ff';
            this.style.borderColor = '#3b82f6';
            hiddenInput.value = this.getAttribute('data-type');
        });
    });

    document.getElementById('report-issue-form').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Ready to send report to Database!');
        // Here is where you will add your fetch('/api/reports', { method: 'POST' })
    });
}