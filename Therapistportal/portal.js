document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view-panel');

    // Tab Switching Logic
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // 1. Remove active state from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // 2. Add active state to clicked item
            item.classList.add('active');
            
            // 3. Get the target view ID
            const targetViewId = `view-${item.getAttribute('data-target')}`;
            
            // 4. Hide all views, show the target view
            views.forEach(view => {
                view.classList.remove('active');
                if (view.id === targetViewId) {
                    view.classList.add('active');
                }
            });
        });
    });

    // Sub-tab logic for "My Clients" filter
    const clientTabs = document.querySelectorAll('.tabs button');
    clientTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            clientTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    // Report Category Button toggle
    const catBtns = document.querySelectorAll('.cat-btn');
    catBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            catBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
});

// new appointment code.

async function loadAppointments() {

    try {

        const response = await fetch(
            "http://localhost:5000/appointments"
        );

        const appointments =
            await response.json();

        const container =
            document.getElementById(
                "upcomingAppointments"
            );

        container.innerHTML = "";

        appointments.forEach((appointment) => {

            const appointmentDiv =
                document.createElement("div");

            appointmentDiv.classList.add(
                "appt-item",
                "confirmed"
            );

            appointmentDiv.innerHTML = `

                <div class="time">
                    ${appointment.time}
                </div>

                <div class="details">

                    <h4>
                        ${appointment.clientName}
                    </h4>

                    <p>
                        Appointment Date:
                        ${appointment.date}
                    </p>

                </div>

            `;
            container.appendChild(
                appointmentDiv
            );
        });
    } catch (error) {

        console.log(error);

    }
}
loadAppointments();