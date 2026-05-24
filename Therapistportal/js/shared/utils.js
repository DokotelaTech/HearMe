// FORMAT DATE

function formatDate(dateString){

    const date =
        new Date(dateString);

    return date.toLocaleDateString(
        "en-US",
        {
            weekday:"short",
            year:"numeric",
            month:"short",
            day:"numeric"
        }
    );
}

// FORMAT TIME

function formatTime(dateString){

    const date =
        new Date(dateString);

    return date.toLocaleTimeString(
        "en-US",
        {
            hour:"2-digit",
            minute:"2-digit"
        }
    );
}

// CREATE INITIALS

function getInitials(first,last){

    return (
        first.charAt(0) +
        last.charAt(0)
    ).toUpperCase();
}