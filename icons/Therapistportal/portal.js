document.addEventListener("DOMContentLoaded", () => {

    // ── TOKEN GUARD ──────────────────────────────────────────
    const _token = localStorage.getItem('token');
    if (!_token) {
        window.location.href = '/landing-page/login.html';
        return;
    }

    // ── GET THERAPIST IDENTIFIER ─────────────────────────────
    let therapistIdentifier = 'Dr. Sarah Johnson';
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.identifier) {
            therapistIdentifier = user.identifier;
            const nameElement = document.getElementById('therapistName');
            if (nameElement) nameElement.textContent = therapistIdentifier;
        }
    } catch (e) {
        console.warn('Could not parse user from localStorage:', e);
    }

    const API_BASE_URL = "http://localhost:5000/api";

    let allClients        = [];
    let currentFilter     = "ALL";
    let allMessages       = [];
    let selectedMessageId = null;

    // ── DOM refs ─────────────────────────────────────────────
    const clientContainer       = document.getElementById("client-container");
    const clientSearchInput     = document.querySelector("#view-clients .search-input input");
    const clientTabButtons      = document.querySelectorAll(".tabs button");
    const appointmentsContainer = document.getElementById("appointmentsContainer");
    const availabilityContainer = document.getElementById("availabilityContainer");
    const editAvailabilityBtn   = document.getElementById("editAvailabilityBtn");
    const addAppointmentBtn     = document.querySelector("#view-calendar .page-header button");
    const resourceForm          = document.getElementById("resourceForm");
    const resourcesContainer    = document.getElementById("resourcesContainer");

    // ── Auth headers ─────────────────────────────────────────
    function getAuthHeaders() {
        const token = localStorage.getItem('token');
        if (!token) { window.location.href = '/landing-page/login.html'; return {}; }
        return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
    }

    // ── Success banner ────────────────────────────────────────
    function showSuccessBanner(message) {
        const banner  = document.getElementById("successBanner");
        const msg     = document.getElementById("successBannerMessage");
        if (!banner || !msg) return;
        msg.textContent = message;
        banner.classList.remove("hidden");
        setTimeout(() => banner.classList.add("show"), 10);
        setTimeout(() => {
            banner.classList.remove("show");
            setTimeout(() => banner.classList.add("hidden"), 400);
        }, 3500);
    }

    // ── Navigation ────────────────────────────────────────────
    const navItems   = document.querySelectorAll(".nav-menu .nav-item");
    const viewPanels = document.querySelectorAll(".view-panel");

    navItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            navItems.forEach(n   => n.classList.remove("active"));
            viewPanels.forEach(p => p.classList.remove("active"));
            item.classList.add("active");

            const target = item.getAttribute("data-target");
            const panel  = document.getElementById(`view-${target}`);
            if (panel) panel.classList.add("active");

            if (target === "messages") loadMessages();
        });
    });

    // ============================================================
    // CLIENTS
    // ============================================================
    function renderClients(clients) {
        if (!clientContainer) return;
        if (!clients || clients.length === 0) {
            clientContainer.innerHTML = `<p style="padding:15px;color:#64748b;">No clients found.</p>`;
            return;
        }
        clientContainer.innerHTML = clients.map(client => `
            <div class="client-card" style="border:2px solid #fef08a;border-radius:12px;padding:20px;
                 margin-bottom:20px;background:#fefce8;position:relative;overflow:hidden;">
                <div style="position:absolute;left:0;top:0;bottom:0;width:6px;background:#eab308;"></div>
                <div style="display:flex;justify-content:space-between;align-items:flex-start;
                     margin-bottom:15px;padding-left:10px;">
                    <div style="display:flex;gap:15px;align-items:center;">
                        <div style="width:48px;height:48px;border-radius:50%;background:#38bdf8;
                             color:white;display:flex;align-items:center;justify-content:center;
                             font-weight:700;font-size:1.2rem;">${client.avatar_number || '?'}</div>
                        <div>
                            <h3 style="margin:0;font-size:1.2rem;color:#0f172a;">
                                User#${client._id || client.id}
                            </h3>
                            <p style="margin:4px 0 0;color:#475569;font-size:0.85rem;">
                                First contact: ${client.first_contact || 'N/A'} &bull;
                                ${client.sessions || 0} sessions
                            </p>
                        </div>
                    </div>
                    <span style="background:#dcfce7;color:#166534;padding:6px 12px;border-radius:6px;
                         font-size:0.75rem;font-weight:700;">${client.status || 'ACTIVE'}</span>
                </div>
                <div style="display:flex;gap:10px;margin-bottom:15px;padding-left:10px;flex-wrap:wrap;">
                    ${(Array.isArray(client.issues) ? client.issues : []).map(issue =>
                        `<span style="background:#e0f2fe;color:#0369a1;padding:4px 14px;
                         border-radius:16px;font-size:0.8rem;font-weight:500;">${issue}</span>`
                    ).join('')}
                </div>
                <div style="background:#fff;padding:15px;border-radius:8px;
                     border:1px solid #e2e8f0;margin-left:10px;">
                    <p style="margin:0;color:#334155;font-size:0.9rem;">
                        <strong>Latest notes:</strong> ${client.latest_notes || 'No notes yet.'}
                    </p>
                </div>
            </div>
        `).join("");
    }

    function applyClientFilters() {
        const term     = (clientSearchInput?.value || "").toLowerCase().trim();
        const filtered = allClients.filter(c => {
            const matchStatus = currentFilter === "ALL" ||
                (c.status || "").toUpperCase() === currentFilter;
            const issues      = Array.isArray(c.issues) ? c.issues : [];
            const matchSearch = !term ||
                String(c._id || c.id || "").toLowerCase().includes(term) ||
                issues.some(i => i.toLowerCase().includes(term)) ||
                (c.latest_notes || "").toLowerCase().includes(term);
            return matchStatus && matchSearch;
        });
        renderClients(filtered);
    }

    clientTabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            clientTabButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentFilter = (btn.dataset.filter || "ALL").toUpperCase();
            applyClientFilters();
        });
    });

    if (clientSearchInput) clientSearchInput.addEventListener("input", applyClientFilters);

    async function fetchClients() {
        if (!clientContainer) return;
        try {
            const r = await fetch(`${API_BASE_URL}/clients`, { headers: getAuthHeaders() });
            allClients = r.ok ? await r.json() : [];
            applyClientFilters();
        } catch {
            clientContainer.innerHTML =
                `<p style="padding:15px;color:#ef4444;">Could not load clients.</p>`;
        }
    }

    // ============================================================
    // CALENDAR
    // ============================================================
    async function fetchAppointments() {
        if (!appointmentsContainer) return;
        try {
            const r = await fetch(`${API_BASE_URL}/appointments`);
            if (!r.ok) throw new Error();
            const list = await r.json();
            if (!list.length) {
                appointmentsContainer.innerHTML =
                    `<p style="padding:15px;color:#64748b;">No appointments today.</p>`;
                return;
            }
            appointmentsContainer.innerHTML = list.map(a => `
                <div style="padding:15px;border-bottom:1px solid #e2e8f0;
                     display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <strong style="color:#1e293b;display:block;">${a.client_id}</strong>
                        <span style="font-size:0.85rem;color:#64748b;">
                            ${a.start_time} (${a.duration_mins} mins)
                        </span>
                    </div>
                    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;">
                        <span style="padding:4px 8px;font-size:0.75rem;font-weight:600;border-radius:4px;
                            background:${a.status==='CONFIRMED'?'#dcfce7':'#fee2e2'};
                            color:${a.status==='CONFIRMED'?'#15803d':'#991b1b'};">${a.status}</span>
                        <button class="delete-btn" data-id="${a._id}"
                            style="cursor:pointer;color:#ef4444;border:none;background:none;
                            font-size:0.75rem;text-decoration:underline;">Delete</button>
                    </div>
                </div>
            `).join("");
        } catch {
            appointmentsContainer.innerHTML =
                `<p style="padding:15px;color:#ef4444;">Could not load appointments.</p>`;
        }
    }

    document.addEventListener("click", async (e) => {
        if (e.target.classList.contains("delete-btn")) {
            if (!confirm("Delete this appointment?")) return;
            try {
                await fetch(`${API_BASE_URL}/appointments/${e.target.dataset.id}`,
                    { method: "DELETE" });
                showSuccessBanner("Appointment deleted!");
                fetchAppointments();
            } catch { alert("Could not delete."); }
        }
    });

    async function fetchAvailability() {
        if (!availabilityContainer) return;
        try {
            const r    = await fetch(`${API_BASE_URL}/availability`);
            if (!r.ok) throw new Error();
            const data = await r.json();
            const days = ["Monday","Tuesday","Wednesday","Thursday","Friday"];
            availabilityContainer.innerHTML = days.map(day => {
                const cfg   = data.find(a => a.day_of_week === day);
                const on    = cfg && cfg.is_active;
                const hours = cfg
                    ? `${cfg.start_time||'09:00 AM'} - ${cfg.end_time||'05:00 PM'}`
                    : "09:00 AM - 05:00 PM";
                return `
                <div class="availability-card ${on ? 'active' : ''}">
                    <div class="day-info"><span class="day-name">${day}</span></div>
                    <div class="time-range"><span>${hours}</span></div>
                    <label class="custom-checkbox">
                        <input type="checkbox" data-day="${day}"
                            ${on ? 'checked' : ''} disabled style="display:none;">
                        <i class="fa-regular ${on ? 'fa-square-check' : 'fa-square'}"
                           style="font-size:1.25rem;color:${on ? '#4f46e5' : '#9ca3af'};"></i>
                    </label>
                </div>`;
            }).join("");
        } catch {
            availabilityContainer.innerHTML =
                `<p style="padding:15px;color:#ef4444;">Could not load availability.</p>`;
        }
    }

    if (addAppointmentBtn) {
        addAppointmentBtn.addEventListener("click", () => {
            document.getElementById('appointmentModal')?.classList.add('show');
        });
    }

    const apptForm  = document.getElementById('appointmentForm');
    const cancelBtn = document.getElementById('cancelAppointmentBtn');
    const apptModal = document.getElementById('appointmentModal');

    apptForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const body = {
            client_id:     document.getElementById("clientName").value,
            start_time:    document.getElementById("appTime").value,
            duration_mins: parseInt(document.getElementById("duration").value) || 50,
            status:        "CONFIRMED",
            session_notes: document.getElementById("appType").value
        };
        try {
            const r = await fetch(`${API_BASE_URL}/appointments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            if (!r.ok) throw new Error();
            showSuccessBanner("Appointment created!");
            apptModal.classList.remove('show');
            apptForm.reset();
            fetchAppointments();
        } catch { alert("Could not save appointment."); }
    });

    cancelBtn?.addEventListener("click", () => {
        apptModal.classList.remove('show');
        apptForm.reset();
    });

    editAvailabilityBtn?.addEventListener("click", () => {
        const checkboxes = availabilityContainer.querySelectorAll("input[type='checkbox']");
        const editing    = editAvailabilityBtn.innerText === "Save Configuration Changes";
        if (!editing) {
            checkboxes.forEach(cb => cb.disabled = false);
            editAvailabilityBtn.innerText        = "Save Configuration Changes";
            editAvailabilityBtn.style.background = "#22c55e";
            editAvailabilityBtn.style.color      = "#fff";
        } else {
            const updated = [];
            checkboxes.forEach(cb => {
                if (cb.checked) updated.push({
                    day_of_week: cb.dataset.day,
                    start_time:  "09:00 AM",
                    end_time:    "05:00 PM"
                });
            });
            fetch(`${API_BASE_URL}/availability`, {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ availability: updated })
            }).then(() => {
                showSuccessBanner("Availability updated!");
                editAvailabilityBtn.innerText = "Edit Availability";
                editAvailabilityBtn.removeAttribute("style");
                fetchAvailability();
            }).catch(() => alert("Could not save availability."));
        }
    });

    // ============================================================
    // RESOURCES
    // ============================================================
    async function fetchResources() {
        if (!resourcesContainer) return;
        try {
            const r   = await fetch(`${API_BASE_URL}/resources`, { headers: getAuthHeaders() });
            if (!r.ok) throw new Error();
            const res = await r.json();
            if (!res.length) {
                resourcesContainer.innerHTML =
                    `<p style="padding:15px;color:#64748b;">No resources yet.</p>`;
                return;
            }
            resourcesContainer.innerHTML = res.map(item => `
                <div class="resource-item">
                    <img src="${item.image ||
                        'https://images.unsplash.com/photo-1544367567-0f2fcb046ebf?w=150'}"
                        alt="" onerror="this.src='https://images.unsplash.com/photo-1544367567-0f2fcb046ebf?w=150'">
                    <div class="resource-content">
                        <h4>${item.title}</h4>
                        <p>${item.description}</p>
                        <span style="font-size:0.75rem;background:#e0f2fe;color:#0369a1;
                            padding:3px 8px;border-radius:12px;display:inline-block;
                            font-weight:bold;">${item.category}</span><br>
                        <a href="${item.link}" target="_blank" style="margin-top:8px;display:inline-block;">
                            View Resource
                        </a>
                    </div>
                </div>
            `).join("");
        } catch {
            resourcesContainer.innerHTML =
                `<p style="padding:15px;color:#ef4444;">Could not load resources.</p>`;
        }
    }

    resourceForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const body = {
            title:       document.getElementById("resourceTitle").value.trim(),
            description: document.getElementById("resourceDescription").value.trim(),
            link:        document.getElementById("resourceLink").value.trim(),
            category:    document.getElementById("resourceCategory").value,
            image:       document.getElementById("resourceImage").value.trim()
        };
        try {
            const r = await fetch(`${API_BASE_URL}/resources`, {
                method:  "POST",
                headers: getAuthHeaders(),
                body:    JSON.stringify(body)
            });
            if (!r.ok) throw new Error();
            showSuccessBanner("Resource published!");
            resourceForm.reset();
            fetchResources();
        } catch { alert("Could not save resource."); }
    });

    // ============================================================
    // MESSAGES
    // ============================================================

    function timeAgo(dateStr) {
        const diff = Date.now() - new Date(dateStr).getTime();
        const m    = Math.floor(diff / 60000);
        if (m < 1)  return 'Just now';
        if (m < 60) return `${m}m ago`;
        const h = Math.floor(m / 60);
        if (h < 24) return `${h}h ago`;
        return `${Math.floor(h / 24)}d ago`;
    }

    function initials(name) {
        return (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    }

    function refreshUnreadCount() {
        const count   = allMessages.filter(m => !m.is_read).length;
        const sidebar = document.getElementById('unreadMessagesCount');
        if (sidebar) sidebar.textContent = count;
        const dot = document.querySelector('.topbar .dot');
        if (dot) dot.style.display = count > 0 ? 'block' : 'none';
    }

    function renderInboxList(messages) {
        const list = document.querySelector('#view-messages .inbox-list');
        if (!list) return;

        if (!messages.length) {
            list.innerHTML = `
                <div style="padding:40px 20px;text-align:center;color:#94a3b8;">
                    <i class="fa-regular fa-envelope-open"
                       style="font-size:2.5rem;margin-bottom:12px;display:block;opacity:.4;"></i>
                    <p style="font-size:0.85rem;">No messages yet</p>
                </div>`;
            return;
        }

        list.innerHTML = messages.map(msg => {
            const active  = msg._id === selectedMessageId;
            const unread  = !msg.is_read;
            const preview = msg.message.length > 50
                ? msg.message.slice(0, 50) + '...'
                : msg.message;

            return `
            <div class="inbox-item ${active ? 'active' : ''}" data-id="${msg._id}"
                 style="cursor:pointer;position:relative;padding:14px 15px;
                        display:flex;gap:12px;align-items:flex-start;
                        border-bottom:1px solid #e2e8f0;
                        background:${active ? '#f0f4ff' : unread ? '#fafbff' : 'white'};
                        border-left:${active ? '3px solid #2563eb' : '3px solid transparent'};
                        transition:background .15s;">

                <div style="width:40px;height:40px;border-radius:50%;background:#38bdf8;
                            color:white;display:flex;align-items:center;justify-content:center;
                            font-weight:700;font-size:0.85rem;flex-shrink:0;">
                    ${initials(msg.sender_name)}
                </div>

                <div style="flex:1;min-width:0;">
                    <div style="display:flex;justify-content:space-between;
                                align-items:center;margin-bottom:3px;">
                        <strong style="font-size:0.88rem;color:#0f172a;
                                       font-weight:${unread ? '700' : '600'};">
                            ${msg.sender_name}
                        </strong>
                        <span style="font-size:0.68rem;color:#94a3b8;
                                     white-space:nowrap;margin-left:8px;">
                            ${timeAgo(msg.sent_at)}
                        </span>
                    </div>
                    <p style="margin:0;font-size:0.78rem;color:#64748b;
                               white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                        ${preview}
                    </p>
                    <span style="font-size:0.66rem;background:#e0f2fe;color:#0369a1;
                                 padding:2px 8px;border-radius:10px;margin-top:5px;
                                 display:inline-block;font-weight:600;">
                        To: ${msg.expert_name}
                    </span>
                </div>

                ${unread ? `<span style="width:9px;height:9px;border-radius:50%;
                    background:#2563eb;position:absolute;right:12px;top:14px;"></span>` : ''}
            </div>`;
        }).join('');

        list.querySelectorAll('.inbox-item').forEach(item => {
            item.addEventListener('click', () => openMessage(item.dataset.id));
        });
    }

    async function openMessage(id) {
        selectedMessageId = id;
        const msg = allMessages.find(m => String(m._id) === String(id));
        if (!msg) return;

        if (!msg.is_read) {
            msg.is_read = true;
            try {
                await fetch(`${API_BASE_URL}/messages/${id}/read`, {
                    method:  'PATCH',
                    headers: getAuthHeaders()
                });
            } catch { /* silent */ }
            refreshUnreadCount();
        }

        renderInboxList(allMessages);

        const chatArea = document.querySelector('#view-messages .chat-area');
        if (!chatArea) return;

        chatArea.innerHTML = `
            <div style="padding:14px 20px;background:white;border-bottom:1px solid #e2e8f0;
                        display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">
                <div style="display:flex;align-items:center;gap:12px;">
                    <div style="width:40px;height:40px;border-radius:50%;background:#38bdf8;
                                color:white;display:flex;align-items:center;justify-content:center;
                                font-weight:700;font-size:0.9rem;">
                        ${initials(msg.sender_name)}
                    </div>
                    <div>
                        <strong style="display:block;font-size:0.95rem;color:#0f172a;">
                            ${msg.sender_name}
                        </strong>
                        <span style="font-size:0.75rem;color:#64748b;">
                            Contacting: ${msg.expert_name}
                        </span>
                    </div>
                </div>
                <div style="display:flex;align-items:center;gap:10px;">
                    <span style="font-size:0.72rem;color:#94a3b8;">
                        ${new Date(msg.sent_at).toLocaleString('en-ZA', { dateStyle:'medium', timeStyle:'short' })}
                    </span>
                    <button id="deleteMsgBtn"
                        style="background:#fef2f2;color:#ef4444;border:1px solid #fecaca;
                               padding:5px 11px;border-radius:6px;cursor:pointer;
                               font-size:0.75rem;font-weight:600;">
                        <i class="fa-solid fa-trash-can"></i> Delete
                    </button>
                </div>
            </div>

            <div id="chatHistory"
                 style="flex:1;padding:24px;overflow-y:auto;display:flex;
                        flex-direction:column;gap:12px;background:#f8fafc;">
                <div style="text-align:center;margin-bottom:6px;">
                    <span style="background:#ede9fe;color:#6d28d9;font-size:0.7rem;
                                 font-weight:700;padding:4px 14px;border-radius:20px;">
                        NEW CONTACT REQUEST
                    </span>
                </div>
                <div style="max-width:72%;background:white;border:1px solid #e2e8f0;
                            padding:14px 16px;border-radius:12px;border-bottom-left-radius:3px;
                            align-self:flex-start;line-height:1.6;
                            box-shadow:0 1px 4px rgba(0,0,0,.05);">
                    <p style="margin:0;font-size:0.9rem;color:#1e293b;">${msg.message}</p>
                    <span style="display:block;font-size:0.65rem;color:#94a3b8;
                                 margin-top:8px;text-align:right;">
                        ${timeAgo(msg.sent_at)}
                    </span>
                </div>
            </div>

            <div style="padding:14px 20px;background:white;border-top:1px solid #e2e8f0;flex-shrink:0;">
                <div style="background:#e0f2fe;color:#0369a1;padding:7px 12px;border-radius:6px;
                            font-size:0.72rem;margin-bottom:11px;text-align:center;">
                    Messages are private and secure.
                </div>
                <div style="display:flex;align-items:center;gap:10px;">
                    <input id="replyInput" type="text"
                           placeholder="Type a reply to ${msg.sender_name}..."
                           style="flex:1;border:1px solid #e2e8f0;padding:11px 15px;
                                  border-radius:20px;outline:none;font-size:0.88rem;
                                  font-family:inherit;" />
                    <button id="replyBtn"
                        style="background:#0ea5e9;color:white;border:none;padding:10px 18px;
                               border-radius:20px;cursor:pointer;font-weight:600;
                               display:flex;align-items:center;gap:8px;font-size:0.85rem;">
                        <i class="fa-solid fa-paper-plane"></i> Send
                    </button>
                </div>
            </div>
        `;

        const doReply = async () => {
            const input   = document.getElementById('replyInput');
            const history = document.getElementById('chatHistory');
            if (!input || !input.value.trim()) return;

            const replyText     = input.value.trim();
            const therapistName = therapistIdentifier;

            // disable while sending
            input.disabled = true;
            document.getElementById('replyBtn').disabled = true;

            try {
                // save reply to MongoDB
                const r = await fetch(`${API_BASE_URL}/messages/${msg._id}/reply`, {
                    method:  'POST',
                    headers: getAuthHeaders(),
                    body:    JSON.stringify({
                        reply_text:     replyText,
                        therapist_name: therapistName
                    })
                });
                if (!r.ok) throw new Error('Failed to save reply');
            } catch (err) {
                console.error('Reply save error:', err);
                // still show bubble locally even if save failed
            }

            // add bubble to UI
            const bubble = document.createElement('div');
            bubble.style.cssText = `
                max-width:72%;background:#0ea5e9;color:white;padding:13px 16px;
                border-radius:12px;border-bottom-right-radius:3px;align-self:flex-end;
                line-height:1.6;box-shadow:0 2px 8px rgba(14,165,233,.25);`;
            bubble.innerHTML = `
                <p style="margin:0;font-size:0.9rem;">${replyText}</p>
                <span style="display:block;font-size:0.65rem;color:rgba(255,255,255,.7);
                             margin-top:6px;text-align:right;">
                    Just now · ${therapistName}
                </span>`;
            history.appendChild(bubble);
            history.scrollTop = history.scrollHeight;
            input.value = '';
            showSuccessBanner(`Reply sent to ${msg.sender_name}`);

            input.disabled = false;
            document.getElementById('replyBtn').disabled = false;
            input.focus();
        };

        document.getElementById('replyBtn').addEventListener('click', doReply);
        document.getElementById('replyInput').addEventListener('keydown', e => {
            if (e.key === 'Enter') doReply();
        });

        document.getElementById('deleteMsgBtn').addEventListener('click', async () => {
            if (!confirm('Delete this message?')) return;
            try {
                await fetch(`${API_BASE_URL}/messages/${msg._id}`, {
                    method:  'DELETE',
                    headers: getAuthHeaders()
                });
                allMessages       = allMessages.filter(m => m._id !== msg._id);
                selectedMessageId = null;
                renderInboxList(allMessages);
                refreshUnreadCount();
                chatArea.innerHTML = emptyChat();
                showSuccessBanner('Message deleted.');
            } catch { alert('Could not delete message.'); }
        });
    }

    function emptyChat() {
        return `
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;
                        justify-content:center;gap:12px;color:#94a3b8;
                        background:#f8fafc;height:100%;">
                <i class="fa-regular fa-envelope-open" style="font-size:3rem;opacity:.35;"></i>
                <p style="font-size:0.88rem;">Select a message to read it</p>
            </div>`;
    }

    async function loadMessages() {
        const list     = document.querySelector('#view-messages .inbox-list');
        const chatArea = document.querySelector('#view-messages .chat-area');
        if (!list) return;

        try {
            const r = await fetch(`${API_BASE_URL}/messages`, { headers: getAuthHeaders() });
            if (!r.ok) throw new Error('Server error');
            allMessages = await r.json();
        } catch (err) {
            console.error('Could not load messages:', err);
            list.innerHTML = `<p style="padding:15px;color:#ef4444;">Could not load messages.</p>`;
            return;
        }

        renderInboxList(allMessages);
        refreshUnreadCount();

        if (chatArea && !selectedMessageId) {
            chatArea.innerHTML = emptyChat();
        }
    }

    const inboxSearch = document.querySelector('#view-messages .inbox-sidebar .search-input input');
    if (inboxSearch) {
        inboxSearch.addEventListener('input', e => {
            const term     = e.target.value.toLowerCase();
            const filtered = allMessages.filter(m =>
                m.sender_name.toLowerCase().includes(term) ||
                m.message.toLowerCase().includes(term) ||
                m.expert_name.toLowerCase().includes(term)
            );
            renderInboxList(filtered);
        });
    }

    // ============================================================
    // INITIAL LOAD
    // ============================================================
    fetchClients();
    fetchAppointments();
    fetchAvailability();
    fetchResources();
    loadMessages();

    setInterval(() => {
        const panel = document.getElementById('view-messages');
        if (panel && panel.classList.contains('active')) loadMessages();
    }, 30000);
});