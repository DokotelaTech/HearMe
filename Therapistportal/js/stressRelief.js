const resourcesContainer = document.getElementById('resourcesContainer');

let allResources = [];

// =========================================
// FETCH THIS THERAPIST'S RESOURCES
// =========================================
async function fetchResources() {
    const response = await apiRequest('/relief/mine');
    if (!response) return;

    allResources = response.resources;
    updateStats();
    renderResources();
}

// =========================================
// UPDATE STATS
// =========================================
function updateStats() {
    document.getElementById('totalResources').textContent = allResources.length;
    document.getElementById('videoCount').textContent =
        allResources.filter(r => r.category === 'Video').length;
    document.getElementById('podcastCount').textContent =
        allResources.filter(r => r.category === 'Podcast').length;

    if (allResources.length > 0) {
        const counts = {};
        allResources.forEach(r => {
            counts[r.category] = (counts[r.category] || 0) + 1;
        });
        const popular = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
        document.getElementById('popularCategory').textContent = popular;
    }
}

// =========================================
// RENDER RESOURCES
// =========================================
function renderResources() {
    resourcesContainer.innerHTML = '';

    if (allResources.length === 0) {
        resourcesContainer.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-photo-film"></i>
                <p>No resources published yet. Use the form to add your first one.</p>
            </div>
        `;
        return;
    }

    allResources.forEach(resource => {
        const badgeClass = {
            Video: 'badge-video',
            Podcast: 'badge-podcast',
            Meditation: 'badge-meditation',
            Motivation: 'badge-motivation'
        }[resource.category] || 'badge-video';

        resourcesContainer.innerHTML += `
            <div class="resource-item" id="resource-${resource._id}">
                ${resource.image
                    ? `<img src="${resource.image}" class="resource-image" alt="${resource.title}"
                        onerror="this.style.display='none'">`
                    : ''}
                <div class="resource-content">
                    <div class="resource-top">
                        <span class="resource-badge ${badgeClass}">${resource.category}</span>
                        <small style="color:#9ca3af;">By ${resource.therapistName}</small>
                    </div>
                    <h4>${resource.title}</h4>
                    <p>${resource.description}</p>
                    <div class="resource-actions">
                        <button class="open-btn" onclick="window.open('${resource.link}', '_blank')">
                            <i class="fa-solid fa-arrow-up-right-from-square"></i> Open Resource
                        </button>
                        <button class="delete-btn" onclick="deleteResource('${resource._id}')">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
}

// =========================================
// DELETE RESOURCE
// =========================================
async function deleteResource(id) {
    if (!confirm('Delete this resource?')) return;

    const response = await apiRequest(`/relief/${id}`, 'DELETE');
    if (!response) return;

    document.getElementById(`resource-${id}`)?.remove();
    allResources = allResources.filter(r => r._id !== id);
    updateStats();

    if (allResources.length === 0) {
        resourcesContainer.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-photo-film"></i>
                <p>No resources published yet.</p>
            </div>
        `;
    }
}

// =========================================
// SUBMIT FORM
// =========================================
document.getElementById('resourceForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const body = {
        title: document.getElementById('resourceTitle').value.trim(),
        description: document.getElementById('resourceDescription').value.trim(),
        link: document.getElementById('resourceLink').value.trim(),
        category: document.getElementById('resourceCategory').value,
        image: document.getElementById('resourceImage').value.trim()
    };

    const response = await apiRequest('/relief', 'POST', body);
    if (!response) return;

    allResources.unshift(response.resource);
    updateStats();
    renderResources();

    e.target.reset();
});

// =========================================
// INIT
// =========================================
fetchResources();