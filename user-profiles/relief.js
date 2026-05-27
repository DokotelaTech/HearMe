// =========================================
// FETCH ALL RELIEF RESOURCES
// =========================================
async function fetchReliefResources() {
    try {
        const response = await fetch('http://localhost:5000/api/relief', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) return;

        const data = await response.json();
        const resources = data.resources;

        // Update stats
        const videos = resources.filter(r => r.category === 'Video');
        const podcasts = resources.filter(r => r.category === 'Podcast');
        const meditations = resources.filter(r => r.category === 'Meditation');
        const motivations = resources.filter(r => r.category === 'Motivation');

        document.getElementById('video-count').textContent = videos.length;
        document.getElementById('podcast-count').textContent = podcasts.length;

        // Podcasts go to audio-list
        renderMedia(
            document.getElementById('audio-list'),
            podcasts,
            'podcast'
        );

        // Videos, Meditations, Motivations go to video-list
        renderMedia(
            document.getElementById('video-list'),
            [...videos, ...meditations, ...motivations],
            'video'
        );

    } catch (error) {
        console.error('Relief fetch error:', error);
    }
}

// =========================================
// RENDER MEDIA CARDS
// =========================================
function renderMedia(container, resources, type) {
    if (!container) return;

    if (resources.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No ${type === 'podcast' ? 'podcasts' : 'videos'} available yet.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';

    resources.forEach(resource => {
        const badgeClass = resource.category === 'Podcast' ? 'podcast-badge' : 'video-badge';

        const card = document.createElement('div');
        card.className = 'media-card';

        const img = resource.image
            ? `<img src="${resource.image}" alt="${resource.title}" class="media-cover" onerror="this.style.display='none'">`
            : '';

        card.innerHTML = `
            ${img}
            <div class="media-content">
                <span class="media-type ${badgeClass}">${resource.category}</span>
                <h4>${resource.title}</h4>
               <p class="creator">By  <b>${resource.therapistName}</b></p>
                <p style="color:#6b7280; margin-bottom:18px; line-height:1.6;">${resource.description}</p>
            </div>
        `;

        const link = document.createElement('a');
        link.href = resource.link;
        link.target = '_blank';
        link.className = 'open-link';
        link.innerHTML = '<i class="fa-solid fa-arrow-up-right-from-square"></i> Open Resource';

        card.querySelector('.media-content').appendChild(link);
        container.appendChild(card);
    });
}

// =========================================
// DROPDOWN TOGGLE
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    const trigger = document.getElementById('dropdownTrigger');
    const menu = document.getElementById('dropdownMenu');

    if (trigger && menu) {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('show');
        });

        document.addEventListener('click', () => {
            menu.classList.remove('show');
        });
    }

    lucide.createIcons();
    fetchReliefResources();
});