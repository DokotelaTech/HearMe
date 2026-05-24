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

            </div>
        `;
    });
}

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