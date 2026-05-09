document.getElementById("saveAppointment")
.addEventListener("click", async () => {

    const clientName =
        document.getElementById("clientName").value;

    const date =
        document.getElementById("appointmentDate").value;

    const time =
        document.getElementById("appointmentTime").value;


    const response = await fetch(
        "http://localhost:5000/appointments",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                clientName,
                date,
                time
            })
        }
    );

    const data = await response.json();

    alert("Appointment Created!");

    window.location.href = "portal.html";

});