let appFeedData = {
    podcasts: [],
    videos: []
};

/* ========================= */
/* INITIALIZE */
/* ========================= */

function initSharedFeed(assignedRole){

    window.activeUserRole = assignedRole;
    const localStoreData =
    localStorage.getItem("hearme_global_links_store");

    if(localStoreData){

        appFeedData =
        JSON.parse(localStoreData);

    }else{

        /* No hardcoded resources */
        appFeedData = {
            podcasts: [],
            videos: []
        };

        saveFeedChanges();
    }

    renderActiveFeeds();
}

/* ========================= */
/* SAVE */
/* ========================= */

function saveFeedChanges(){

    localStorage.setItem(
        "hearme_global_links_store",
        JSON.stringify(appFeedData)
    );
}

/* ========================= */
/* RENDER */
/* ========================= */

function renderActiveFeeds(){

    const audioContainer =
    document.getElementById("audio-list");

    const videoContainer =
    document.getElementById("video-list");

    const podcastCount =
    document.getElementById("podcast-count");

    const videoCount =
    document.getElementById("video-count");

    /* Dynamic counters */
    if(podcastCount){
        podcastCount.textContent =
        appFeedData.podcasts.length;
    }

    if(videoCount){
        videoCount.textContent =
        appFeedData.videos.length;
    }

    /* ================= PODCASTS ================= */

    if(audioContainer){

        audioContainer.innerHTML = "";

        if(appFeedData.podcasts.length === 0){

            audioContainer.innerHTML = `

                <div class="empty-state">

                    <i class="fa-solid fa-headphones"></i>

                    <h3>No Podcasts Yet</h3>

                    <p>
                        Therapists have not uploaded
                        any podcast resources yet.
                    </p>

                </div>

            `;

        }else{

            appFeedData.podcasts.forEach(item=>{

                audioContainer.innerHTML +=
                createMediaCard(item,"Podcast");

            });

        }

    }

    /* ================= VIDEOS ================= */

    if(videoContainer){

        videoContainer.innerHTML = "";

        if(appFeedData.videos.length === 0){

            videoContainer.innerHTML = `

                <div class="empty-state">

                    <i class="fa-solid fa-video"></i>

                    <h3>No Videos Yet</h3>

                    <p>
                        Therapists have not uploaded
                        any video resources yet.
                    </p>

                </div>

            `;

        }else{

            appFeedData.videos.forEach(item=>{

                videoContainer.innerHTML +=
                createMediaCard(item,"Video");

            });

        }

    }

}

/* ========================= */
/* CREATE MEDIA CARD */
/* ========================= */

function createMediaCard(item,type){

    const badgeClass =
    type === "Video"
    ? "video-badge"
    : "podcast-badge";

    const defaultImage =
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80";

    return `

        <div class="media-card">

            <div class="media-image-wrapper">

                <img
                    src="${item.image || defaultImage}"
                    class="media-cover"
                    alt="${item.title}"
                >

                <div class="media-overlay">

                    <span class="media-type ${badgeClass}">
                        ${type}
                    </span>

                </div>

            </div>

            <div class="media-content">

                <h4>${item.title}</h4>

                <p class="creator">
                    <i class="fa-solid fa-user-doctor"></i>
                    ${item.therapist || "HearMe Therapist"}
                </p>

                <a
                    href="${item.link}"
                    target="_blank"
                    class="open-link"
                >

                    Open Resource

                    <i class="fa-solid fa-arrow-up-right-from-square"></i>

                </a>

            </div>

        </div>

    `;
}

/* ========================= */
/* AUTO START */
/* ========================= */

document.addEventListener("DOMContentLoaded",()=>{

    initSharedFeed("user");

});

// =========================
// PAGE TRANSITION SYSTEM
// =========================

// Fade IN when page loads
document.addEventListener("DOMContentLoaded", () => {
    document.body.style.opacity = "1";
});

// Handle navigation clicks
document.querySelectorAll("a.nav-item").forEach(link => {
    link.addEventListener("click", function (e) {

        const href = this.getAttribute("href");

        // Only apply to internal links
        if (href && !href.startsWith("#")) {
            e.preventDefault();

            // fade out current page
            document.body.classList.add("fade-out");

            // wait for animation then go
            setTimeout(() => {
                window.location.href = href;
            }, 300); // must match CSS duration
        }
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const trigger = document.getElementById('dropdownTrigger');
    const menu = document.getElementById('dropdownMenu');

    if (trigger && menu) {
        // Toggle menu view when clicking the profile element
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('show');
        });

        // Close menu dynamically if the user clicks anywhere else outside of it
        document.addEventListener('click', (e) => {
            if (!trigger.contains(e.target) && !menu.contains(e.target)) {
                menu.classList.remove('show');
            }
        });
    }
});