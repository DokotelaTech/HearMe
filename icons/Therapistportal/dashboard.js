// =========================
// CLIENT DATA
// =========================
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

// =========================
// RENDER CLIENTS
// =========================
function renderClients(filterStatus = "all", searchTerm = "") {
    const container = document.getElementById("client-container");
    if (!container) return;

    const filtered = clients.filter(client => {
        const matchesStatus =
            filterStatus === "all" || client.status === filterStatus;

        const matchesSearch =
            client.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

        return matchesStatus && matchesSearch;
    });

    if (filtered.length === 0) {
        container.innerHTML = `<p style="padding:20px;color:#64748b;">No clients found matching your criteria.</p>`;
        return;
    }

    container.innerHTML = filtered.map(client => `
        <div class="client-card ${client.color === "yellow" ? "highlight-yellow" : ""}">
            <div class="c-header">
                <div class="c-avatar blue">${client.id.split("#")[1].substring(0, 2)}</div>

                <div class="c-title">
                    <h3>${client.id}</h3>
                    <span>First contact: ${client.firstContact} • ${client.sessions} sessions</span>
                </div>

                <span class="status-badge green">
                    ${client.status.toUpperCase()}
                </span>
            </div>

            <div class="c-tags">
                ${client.tags.map(tag => `<span class="tag blue">${tag}</span>`).join("")}
            </div>

            <div class="c-note">
                <strong>Latest notes:</strong> ${client.latestNote}
            </div>

            <div class="c-footer">
                <span class="date-info">
                    <i class="fa-regular fa-calendar"></i>
                    Last session: ${client.lastSession}
                    ${client.unreadMessages > 0 ? `• <span class="purple-text"><i class="fa-regular fa-message"></i> ${client.unreadMessages} new messages</span>` : ""}
                </span>

                <div class="actions">
                    <button class="btn-primary" onclick="handleAction('Message Client', '${client.id}')">
                        <i class="fa-regular fa-message"></i> Message Client
                    </button>
                    <button class="btn-outline" onclick="handleAction('Schedule Session', '${client.id}')">
                        <i class="fa-regular fa-calendar"></i> Schedule Session
                    </button>
                    <button class="btn-outline" onclick="handleAction('View Notes', '${client.id}')">
                        <i class="fa-regular fa-file-lines"></i> View Notes
                    </button>
                </div>
            </div>
        </div>
    `).join("");
}

// =========================
// ACTION HANDLER
// =========================
function handleAction(actionType, clientId) {
    alert(`${actionType} action triggered for ${clientId}`);
}

// =========================
// INIT
// =========================
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.querySelector(".search-input input");
    const filterBtns = document.querySelectorAll(".f-btn");

    if (!searchInput) return;

    searchInput.addEventListener("input", (e) => {
        const activeBtn = document.querySelector(".f-btn.active");
        const status = activeBtn ? activeBtn.innerText.toLowerCase() : "all";
        renderClients(status, e.target.value);
    });

    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            filterBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const status = btn.innerText.toLowerCase();
            renderClients(status, searchInput.value);
        });
    });

    renderClients();
});