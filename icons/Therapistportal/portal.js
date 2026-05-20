// ===============================
// HEARME PORTAL NAVIGATION SYSTEM
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    // ===============================
    // AUTH TOKEN
    // ===============================

    const getToken = () => localStorage.getItem("token");

    // Do not stop the whole page if token is missing.
    // The portal should still open; only resource loading/saving will be blocked.
    if (!getToken()) {
        console.warn("No token found. Please login first.");
    }

    // ===============================
    // NAVIGATION
    // ===============================

    const navItems = document.querySelectorAll(".nav-item");
    const viewPanels = document.querySelectorAll(".view-panel");

    navItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();

            navItems.forEach(nav => nav.classList.remove("active"));
            item.classList.add("active");

            viewPanels.forEach(panel => {
                panel.classList.remove("active");
            });

            const target = item.getAttribute("data-target");
            const targetPanel = document.getElementById(`view-${target}`);

            if (targetPanel) {
                targetPanel.classList.add("active");
            }
        });
    });

    // ===============================
    // STRESS RELIEF RESOURCE SYSTEM
    // ===============================

    const resourceForm = document.getElementById("resourceForm");
    const resourcesContainer = document.getElementById("resourcesContainer");

    const totalResources = document.getElementById("totalResources");
    const videoCount = document.getElementById("videoCount");
    const podcastCount = document.getElementById("podcastCount");
    const popularCategory = document.getElementById("popularCategory");

    let resources = [];

    // ===============================
    // RENDER RESOURCES
    // ===============================

    function renderResources(resourceList) {
        if (!resourcesContainer) return;

        const safeResources = Array.isArray(resourceList) ? resourceList : [];

        resourcesContainer.innerHTML = "";

        let videos = 0;
        let podcasts = 0;

        if (safeResources.length === 0) {
            resourcesContainer.innerHTML = `
                <p style="padding: 16px; color: #64748b;">
                    No resources published yet.
                </p>
            `;

            if (totalResources) totalResources.textContent = "0";
            if (videoCount) videoCount.textContent = "0";
            if (podcastCount) podcastCount.textContent = "0";
            if (popularCategory) popularCategory.textContent = "None";
            return;
        }

        safeResources.forEach(resource => {

            if (resource.category === "Video") {
                videos++;
            }

            if (resource.category === "Podcast") {
                podcasts++;
            }

            const card = document.createElement("div");
            card.className = "published-resource";

            card.innerHTML = `
                <img
                    src="${resource.image || 'https://picsum.photos/300/180'}"
                    alt="resource"
                >

                <div class="published-content">
                    <span class="resource-category">
                        ${resource.category}
                    </span>

                    <h3>${resource.title}</h3>

                    <p>${resource.description}</p>

                    <a
                        href="${resource.link}"
                        target="_blank"
                        class="btn-primary"
                    >
                        Open Resource
                    </a>
                </div>
            `;

            resourcesContainer.appendChild(card);
        });

        if (totalResources) totalResources.textContent = safeResources.length;
        if (videoCount) videoCount.textContent = videos;
        if (podcastCount) podcastCount.textContent = podcasts;

        if (popularCategory) {
            if (videos > podcasts) {
                popularCategory.textContent = "Videos";
            } else if (podcasts > videos) {
                popularCategory.textContent = "Podcasts";
            } else {
                popularCategory.textContent = "Balanced";
            }
        }
    }

    // ===============================
    // LOAD RESOURCES FROM DATABASE
    // ===============================

    async function loadResources() {
        const token = getToken();

        if (!token) {
            renderResources([]);
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/resources", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("Load resources error:", data);
                renderResources([]);
                return;
            }

            if (!Array.isArray(data)) {
                console.error("Resources response is not an array:", data);
                renderResources([]);
                return;
            }

            resources = data;
            renderResources(resources);

        } catch (error) {
            console.error("Load resources error:", error);
            renderResources([]);
        }
    }

    // ===============================
    // PUBLISH RESOURCE TO DATABASE
    // ===============================

    if (resourceForm) {
        resourceForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const token = getToken();

            if (!token) {
                alert("Please login first before publishing resources.");
                return;
            }

            const payload = {
                title: document.getElementById("resourceTitle").value.trim(),
                description: document.getElementById("resourceDescription").value.trim(),
                link: document.getElementById("resourceLink").value.trim(),
                category: document.getElementById("resourceCategory").value,
                image: document.getElementById("resourceImage").value.trim()
            };

            try {
                const response = await fetch("http://localhost:5000/api/resources", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();

                if (!response.ok) {
                    alert(data.message || "Failed to publish resource.");
                    return;
                }

                alert("Resource published successfully!");
                resourceForm.reset();
                loadResources();

            } catch (error) {
                console.error("Publish resource error:", error);
                alert("Could not connect to server.");
            }
        });
    }

    // ===============================
    // QUICK STRESS RELIEF TIPS
    // ===============================

    const tips = [
        "Take 5 deep breaths slowly.",
        "Drink water and stretch your shoulders.",
        "Listen to calming music for 10 minutes.",
        "Practice gratitude journaling.",
        "Try the 5-4-3-2-1 grounding method."
    ];

    const tipsList = document.getElementById("tipsList");

    if (tipsList) {
        tipsList.innerHTML = "";
        tips.forEach(tip => {
            const li = document.createElement("li");
            li.textContent = tip;
            tipsList.appendChild(li);
        });
    }

    // ===============================
    // INITIAL LOAD
    // ===============================

    loadResources();

});