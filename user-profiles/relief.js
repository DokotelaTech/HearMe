// Central data state array matrix holding global resource pointers
let appFeedData = {
    podcasts: [],
    videos: []
};

// Orchestrates and reads localized browser configurations depending on file page state
function initSharedFeed(assignedRole) {
    window.activeUserRole = assignedRole;

    // Pull previously cached values out of browser state containers
    const localStoreData = localStorage.getItem('hearme_global_links_store');
    
    if (localStoreData) {
        appFeedData = JSON.parse(localStoreData);
    } else {
        // Build initial placeholder structures on baseline startup executions
        appFeedData = {
            podcasts: [{ id: "aud-default-1", title: "Guided Anxiety Management", therapist: "Dr. Jane Carters", link: "https://spotify.com" }],
            videos: [{ id: "vid-default-1", title: "5-Min Quick De-escalation Ritual", therapist: "Mindfulness Center", link: "https://youtube.com" }]
        };
        saveFeedChanges();
    }
    renderActiveFeeds();
}

// Write tracking state modifications to persistent client window container storage
function saveFeedChanges() {
    localStorage.setItem('hearme_global_links_store', JSON.stringify(appFeedData));
}

// Regenerates clean list streams dynamically matching view rights clearance
function renderActiveFeeds() {
    const audioContainer = document.getElementById('audio-list');
    const videoContainer = document.getElementById('video-list');
    const isTherapistMode = (window.activeUserRole === 'therapist');

    if (audioContainer) {
        audioContainer.innerHTML = appFeedData.podcasts.length === 0 ? '<p class="empty-state-msg">No active podcasts uploaded.</p>' : '';
        appFeedData.podcasts.forEach(item => {
            audioContainer.insertAdjacentHTML('beforeend', createLinkRowComponentHtml(item, 'podcasts', isTherapistMode));
        });
    }

    if (videoContainer) {
        videoContainer.innerHTML = appFeedData.videos.length === 0 ? '<p class="empty-state-msg">No active videos uploaded.</p>' : '';
        appFeedData.videos.forEach(item => {
            videoContainer.insertAdjacentHTML('beforeend', createLinkRowComponentHtml(item, 'videos', isTherapistMode));
        });
    }
}

// Factory structural template builder parsing explicit link elements clean of image markers
function createLinkRowComponentHtml(dataNode, sectionKey, displayRemoveBtn) {
    return `
        <div class="media-link-row">
            <div class="media-link-content">
                <a href="${dataNode.link}" target="_blank" class="media-hyperlink">
                    ${dataNode.title} <i class="fa-solid fa-arrow-up-right-from-square"></i>
                </a>
                <span class="media-link-creator">By: ${dataNode.therapist}</span>
            </div>
            ${displayRemoveBtn ? `
                <button class="media-link-delete-trigger" onclick="purgeResourceNode('${dataNode.id}', '${sectionKey}')" title="Delete Link">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            ` : ''}
        </div>
    `;
}

// Inject new podcast line element properties
function addAudio() {
    const titleField = document.getElementById('audio-title');
    const therapistField = document.getElementById('audio-therapist');
    const linkField = document.getElementById('audio-link');

    const title = titleField ? titleField.value.trim() : '';
    const therapist = therapistField ? therapistField.value.trim() : 'Staff Practitioner';
    const link = linkField ? linkField.value.trim() : '';

    if (!title || !link) return alert('Please input at least a title and valid web hyperlink.');

    appFeedData.podcasts.push({
        id: "podcast_" + Date.now(),
        title: title,
        therapist: therapist,
        link: link
    });

    saveFeedChanges();
    renderActiveFeeds();

    // Zero out string buffers
    if (titleField) titleField.value = '';
    if (therapistField) therapistField.value = '';
    if (linkField) linkField.value = '';
}

// Inject new video line element properties
function addVideo() {
    const titleField = document.getElementById('video-title');
    const therapistField = document.getElementById('video-therapist');
    const linkField = document.getElementById('video-link');

    const title = titleField ? titleField.value.trim() : '';
    const therapist = therapistField ? therapistField.value.trim() : 'Staff Practitioner';
    const link = linkField ? linkField.value.trim() : '';

    if (!title || !link) return alert('Please input at least a title and valid web hyperlink.');

    appFeedData.videos.push({
        id: "video_" + Date.now(),
        title: title,
        therapist: therapist,
        link: link
    });

    saveFeedChanges();
    renderActiveFeeds();

    // Zero out string buffers
    if (titleField) titleField.value = '';
    if (therapistField) therapistField.value = '';
    if (linkField) linkField.value = '';
}

// Destructive tracking method allowing therapist side to wipe targeting indices
function purgeResourceNode(targetId, trackingMatrixKey) {
    appFeedData[trackingMatrixKey] = appFeedData[trackingMatrixKey].filter(node => node.id !== targetId);
    saveFeedChanges();
    renderActiveFeeds();
}
