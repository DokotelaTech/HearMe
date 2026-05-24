const appointmentsContainer =
    document.getElementById(
        "appointments-list-container"
    );

let appointments = [];

// FETCH APPOINTMENTS

async function fetchAppointments(){

    const response =
        await apiRequest(
            "/appointments"
        );

    if(!response){
        return;
    }

    appointments =
        response.appointments;

    renderAppointments();
}

// RENDER

function renderAppointments(){

    appointmentsContainer.innerHTML = "";

    if(appointments.length === 0){

        appointmentsContainer.innerHTML = `
            <div class="empty-state">
                No appointments scheduled.
            </div>
        `;

        return;
    }

    appointments.forEach(appointment => {

        appointmentsContainer.innerHTML += `

            <div class="appt-item">

                <div class="appt-time">
                    ${formatTime(
                        appointment.date
                    )}
                </div>

                <div class="appt-content">

                    <h3>
                        ${appointment.clientName}
                    </h3>

                    <p>
                        ${formatDate(
                            appointment.date
                        )}
                    </p>

                </div>

            </div>
        `;
    });
}

// INIT

fetchAppointments();