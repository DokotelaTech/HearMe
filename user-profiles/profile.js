// Initialize Lucide Icons
lucide.createIcons();

// Roadmap Interactivity Logic
document.addEventListener('DOMContentLoaded', () => {
    const taskItems = document.querySelectorAll('.task-item');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    function updateProgress() {
        const totalTasks = taskItems.length;
        const completedTasks = document.querySelectorAll('.task-item.completed').length;
        
        // Calculate Percentage
        const percentage = Math.round((completedTasks / totalTasks) * 100);
        
        // Update UI Elements
        progressBar.style.width = `${percentage}%`;
        progressText.innerText = `${percentage}% Complete`;
    }

    // Add click events to toggle tasks
    taskItems.forEach(item => {
        item.addEventListener('click', () => {
            // Toggle completed class
            item.classList.toggle('completed');

            // Toggle icon between check and outline
            const checkContainer = item.querySelector('.task-check');
            if (item.classList.contains('completed')) {
                checkContainer.innerHTML = '<i data-lucide="check-circle-2"></i>';
            } else {
                checkContainer.innerHTML = '<div class="circle-outline"></div>';
            }
            
            // Re-initialize any new icons that were just added to the DOM
            lucide.createIcons();
            
            // Recalculate progress bar
            updateProgress();
        });
    });

    // Run once on load to establish the initial 40% (2 out of 5 tasks)
    updateProgress();
});