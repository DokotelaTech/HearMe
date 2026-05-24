const reportForm =
    document.getElementById(
        "report-issue-form"
    );

reportForm.addEventListener(
    "submit",
    submitReport
);

// SUBMIT REPORT

async function submitReport(event){

    event.preventDefault();

    const description =
        document.getElementById(
            "report-description-input"
        ).value;

    const category =
        document.getElementById(
            "report-category-input"
        ).value;

    const response =
        await apiRequest(
            "/reports",
            "POST",
            {
                category,
                description
            }
        );

    if(response){

        alert(
            "Report submitted successfully"
        );

        reportForm.reset();
    }
}