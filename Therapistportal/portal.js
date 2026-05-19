// NAVIGATION

const navItems = document.querySelectorAll(".nav-item");
const panels = document.querySelectorAll(".view-panel");

navItems.forEach(item => {

    item.addEventListener("click", function(e){

        e.preventDefault();

        navItems.forEach(nav => nav.classList.remove("active"));
        this.classList.add("active");

        panels.forEach(panel => {
            panel.classList.remove("active");
        });

        const target = this.dataset.target;

        document
            .getElementById(`view-${target}`)
            .classList.add("active");

    });

});

// TIPS

const tips = [
    "Practice deep breathing for 2 minutes daily.",
    "Drink water regularly during stressful days.",
    "Listen to calming music before sleeping.",
    "Meditation improves emotional regulation.",
    "Short walks reduce anxiety significantly."
];

const tipsList = document.getElementById("tipsList");

tips.forEach(tip => {

    const li = document.createElement("li");
    li.textContent = tip;

    tipsList.appendChild(li);

});

// RESOURCES

const resourceForm = document.getElementById("resourceForm");
const resourcesContainer = document.getElementById("resourcesContainer");

let resources = [];

function updateStats(){

    document.getElementById("totalResources").textContent = resources.length;

    const videos = resources.filter(r => r.category === "Video").length;
    const podcasts = resources.filter(r => r.category === "Podcast").length;

    document.getElementById("videoCount").textContent = videos;
    document.getElementById("podcastCount").textContent = podcasts;

    const categoryCount = {};

    resources.forEach(r => {

        categoryCount[r.category] =
            (categoryCount[r.category] || 0) + 1;

    });

    let topCategory = "None";
    let max = 0;

    for(let category in categoryCount){

        if(categoryCount[category] > max){

            max = categoryCount[category];
            topCategory = category;

        }

    }

    document.getElementById("popularCategory").textContent =
        topCategory;

}

function renderResources(){

    if(resources.length === 0){

        resourcesContainer.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-photo-film"></i>
                <h3>No Resources Yet</h3>
                <p>Uploaded resources will appear here.</p>
            </div>
        `;

        updateStats();
        return;

    }

    resourcesContainer.innerHTML = "";

    resources.forEach((resource, index) => {

        let badgeClass = "badge-video";

        if(resource.category === "Podcast"){
            badgeClass = "badge-podcast";
        }

        if(resource.category === "Meditation"){
            badgeClass = "badge-meditation";
        }

        if(resource.category === "Motivation"){
            badgeClass = "badge-motivation";
        }

        resourcesContainer.innerHTML += `

            <div class="resource-item">

                <img
                    src="${resource.image || 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop'}"
                    class="resource-image"
                >

                <div class="resource-content">

                    <span class="resource-badge ${badgeClass}">
                        ${resource.category}
                    </span>

                    <h3 style="margin-top:15px;">
                        ${resource.title}
                    </h3>

                    <p style="margin-top:12px; color:#6b7280;">
                        ${resource.description}
                    </p>

                    <div class="resource-actions">

                        <button
                            class="open-btn"
                            onclick="window.open('${resource.link}')"
                        >
                            Open
                        </button>

                        <button
                            class="delete-btn"
                            onclick="deleteResource(${index})"
                        >
                            <i class="fa-solid fa-trash"></i>
                        </button>

                    </div>

                </div>

            </div>

        `;

    });

    updateStats();

}

resourceForm.addEventListener("submit", function(e){

    e.preventDefault();

    const title =
        document.getElementById("resourceTitle").value;

    const description =
        document.getElementById("resourceDescription").value;

    const link =
        document.getElementById("resourceLink").value;

    const category =
        document.getElementById("resourceCategory").value;

    const image =
        document.getElementById("resourceImage").value;

    resources.unshift({
        title,
        description,
        link,
        category,
        image
    });

    renderResources();

    resourceForm.reset();

});

function deleteResource(index){

    resources.splice(index, 1);

    renderResources();

}

renderResources();
