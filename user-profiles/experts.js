// Initialize Lucide Icons
lucide.createIcons();

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Tag Filter Interactivity
    const tags = document.querySelectorAll('.filter-tags .tag');
    
    tags.forEach(tag => {
        tag.addEventListener('click', () => {
            // Remove active class from all tags
            tags.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tag
            tag.classList.add('active');
        });
    });

    // 2. "Near Me" Location Error Toggle
    const nearMeBtn = document.getElementById('near-me-btn');
    const locationErrorAlert = document.getElementById('location-error');

    // On page load, show the alert to match the screenshot
    locationErrorAlert.style.display = 'flex'; 

    nearMeBtn.addEventListener('click', () => {
        // Toggle the visibility of the location error banner for demonstration
        if (locationErrorAlert.style.display === 'none' || locationErrorAlert.style.display === '') {
            locationErrorAlert.style.display = 'flex';
        } else {
            locationErrorAlert.style.display = 'none';
        }
    });

});