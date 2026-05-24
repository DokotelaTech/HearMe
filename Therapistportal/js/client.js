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

const clientsContainer =
    document.getElementById(
        "clients-list-container"
    );

// CLIENT STATE

let clients = [];

// FETCH CLIENTS

async function fetchClients(){

    const response =
        await apiRequest(
            "/therapist/clients"
        );

    if(!response){
        return;
    }

    clients = response.clients;

    renderClients();
}

// RENDER CLIENTS

function renderClients(){

    clientsContainer.innerHTML = "";

    if(clients.length === 0){

        clientsContainer.innerHTML = `
            <div class="empty-state">
                No clients found.
            </div>
        `;

        return;
    }

    clients.forEach(client => {

        const initials =
            getInitials(
                client.firstName,
                client.lastName
            );

        clientsContainer.innerHTML += `

            <div class="client-card">

                <div class="c-header">

                    <div class="c-avatar">
                        ${initials}
                    </div>

                    <div>

                        <h3>
                            ${client.firstName}
                            ${client.lastName}
                        </h3>

                        <p>
                            ${client.issue}
                        </p>

                    </div>

                </div>

                <div class="c-footer">

                    <span>
                        Sessions:
                        ${client.sessions}
                    </span>

                    <button
                        class="btn-primary"
                        onclick="openClientMessage(
                            '${client._id}'
                        )"
                    >
                        Message
                    </button>

                </div>

>>>>>>> 98ea0a3 (sprint 2)
            </div>
        `;
    });
}

<<<<<<< HEAD
async function updateStatus(appointmentId, status) {
    const response = await apiRequest(
        `/appointments/${appointmentId}/status`,
        'PATCH',
        { status }
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
    );

    window.location.href =
        "message.html";
}

// INIT

fetchClients();
>>>>>>> 98ea0a3 (sprint 2)
