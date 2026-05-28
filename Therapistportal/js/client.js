<<<<<<< HEAD
<<<<<<< HEAD
(function() {

const clientsContainer = document.getElementById("clients-list-container");
if (!clientsContainer) return;

let pendingAppointments = [];

async function fetchClients() {
    const response = await apiRequest("/appointments/therapist");
    if (!response) return;
    pendingAppointments = response.appointments.filter(a => a.status === 'pending');
    renderClients();
}

function renderClients() {
    clientsContainer.innerHTML = "";

    if (pendingAppointments.length === 0) {
        clientsContainer.innerHTML = `
            <div class="empty-state">
                No pending appointment requests.
            </div>
        `;
        return;
    }

    pendingAppointments.forEach(appointment => {
        clientsContainer.innerHTML += `
            <div class="client-card" id="appt-${appointment._id}">
                <div class="c-header">
                    <div class="c-avatar">
                        ${appointment.clientName?.charAt(0) || '?'}
                    </div>
                    <div>
                        <h3>${appointment.clientName || 'Unknown'}</h3>
                        <p>${appointment.type} — ${appointment.date} at ${appointment.time}</p>
                        <p>${appointment.notes || 'No notes provided'}</p>
                    </div>
                </div>
                <div class="c-footer">
                    <button class="btn-primary" onclick="updateStatus('${appointment._id}', 'approved')">
                        Accept
                    </button>
                    <button class="btn-secondary" onclick="updateStatus('${appointment._id}', 'denied')">
                        Decline
                    </button>
                </div>
=======
// CONTAINER
=======
(function() {
>>>>>>> ce02a37 (new features)

const clientsContainer = document.getElementById("clients-list-container");
if (!clientsContainer) return; // ← now valid, inside a function

let pendingAppointments = [];

async function fetchClients() {
    const response = await apiRequest("/appointments/therapist");
    if (!response) return;
    pendingAppointments = response.appointments.filter(a => a.status === 'pending');
    renderClients();
}

function renderClients() {
    clientsContainer.innerHTML = "";

    if (pendingAppointments.length === 0) {
        clientsContainer.innerHTML = `
            <div class="empty-state">
                No pending appointment requests.
            </div>
        `;
        return;
    }

    pendingAppointments.forEach(appointment => {
        clientsContainer.innerHTML += `
            <div class="client-card" id="appt-${appointment._id}">
                <div class="c-header">
                    <div class="c-avatar">
                        ${appointment.clientName?.charAt(0) || '?'}
                    </div>
                    
                    <div>
                        <h3>${appointment.clientName || 'Unknown'}</h3>
                        <p>${appointment.type} — ${appointment.date} at ${appointment.time}</p>
                        <p>${appointment.notes || 'No notes provided'}</p>
                    </div>
                </div>
                
                <div class="c-footer">
                    <button class="btn-primary" onclick="updateStatus('${appointment._id}', 'confirmed')">
                        Accept
                    </button>
                    <button class="btn-secondary" onclick="updateStatus('${appointment._id}', 'declined')">
                        Decline
                    </button>
                </div>
<<<<<<< HEAD

>>>>>>> 98ea0a3 (sprint 2)
=======
>>>>>>> ce02a37 (new features)
            </div>
        `;
    });
}

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> ce02a37 (new features)
async function updateStatus(appointmentId, status) {
    const response = await apiRequest(
        `/appointments/${appointmentId}/status`,
        'PATCH',
        { status }
<<<<<<< HEAD
    );

    if (!response) return;

    document.getElementById(`appt-${appointmentId}`)?.remove();
    pendingAppointments = pendingAppointments.filter(a => a._id !== appointmentId);

    if (pendingAppointments.length === 0) {
        clientsContainer.innerHTML = `
            <div class="empty-state">
                No pending appointment requests.
            </div>
        `;
    }
}

window.updateStatus = updateStatus;

fetchClients();

})();
=======
// OPEN MESSAGE PAGE

function openClientMessage(clientId){

    localStorage.setItem(
        "activeClientId",
        clientId
=======
>>>>>>> ce02a37 (new features)
    );

    if (!response) return;

    document.getElementById(`appt-${appointmentId}`)?.remove();
    pendingAppointments = pendingAppointments.filter(a => a._id !== appointmentId);

    if (pendingAppointments.length === 0) {
        clientsContainer.innerHTML = `
            <div class="empty-state">
                No pending appointment requests.
            </div>
        `;
    }
}

// expose updateStatus so onclick can reach it
window.updateStatus = updateStatus;

fetchClients();
<<<<<<< HEAD
>>>>>>> 98ea0a3 (sprint 2)
=======

})();
>>>>>>> ce02a37 (new features)
