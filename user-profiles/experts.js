/**
 * HearMe - Experts Directory Interaction Subsystem
 * Logic handles geolocation tracking, dynamic component creation, 
 * fuzzy queries and cross-filtering.
 */

// Mock Dynamic Experts Source Layer
const EXPERTS_DATASET = [];

// App Core State
let currentSpecialtyFilter = "all";
let searchStringQuery = "";
let clientUserCoordinates = null;
let orderNearestActive = false;

// Element Nodes Mapping
const UI = {
    container: document.getElementById("experts-container"),
    searchInput: document.getElementById("search-input"),
    filterContainer: document.getElementById("specialty-filters"),
    nearMeButton: document.getElementById("near-me-btn"),
    errorBanner: document.getElementById("location-error"),
    errorMessageText: document.getElementById("location-error-text")
};

/**
 * Main Dynamic Generator Engine
 */
function displayExpertsList(expertsArray) {
    UI.container.innerHTML = "";

    if (expertsArray.length === 0) {
        UI.container.innerHTML = `
            <div class="no-results-msg">
                <i data-lucide="search-code"></i>
                <p>No verified professionals found matching those search criteria.</p>
            </div>`;
        lucide.createIcons();
        return;
    }

    expertsArray.forEach((expert, loopIdx) => {
        // Map dynamic avatar variations systematically
        const shadeGroup = (loopIdx % 4) + 1;
        
        // Calculate Distance if location metadata exists
        let geographicalDistanceMetricHTML = `
            <span class="dist-val remote">
                <i data-lucide="globe"></i> Remote Available
            </span>`;
        
        if (clientUserCoordinates && expert.coordinates) {
            const distanceValueKm = determineHaversineKilometers(
                clientUserCoordinates.lat, 
                clientUserCoordinates.lng,
                expert.coordinates.lat,
                expert.coordinates.lng
            );
            geographicalDistanceMetricHTML = `
                <span class="dist-val">
                    <i data-lucide="map-pin"></i> ${distanceValueKm.toFixed(1)} km away
                </span>`;
        }

        // Structural Injection Blueprint inheriting styles perfectly
        const singleExpertMarkupCard = `
            <div class="expert-card" data-expert-id="${expert.id}">
                <div class="card-layout-wrapper">
                    <div class="card-aside">
                        <div class="expert-avatar theme-shade-${shadeGroup}">
                            ${expert.initials}
                        </div>
                        <span class="status-badge ${expert.available ? 'available' : 'busy'}">
                            ${expert.available ? 'Available' : 'Busy'}
                        </span>
                    </div>
                    
                    <div class="card-body">
                        <div class="card-meta-header">
                            <div class="title-row">
                                <h3>${expert.name}</h3>
                                ${expert.verified ? `<span class="verified-badge"><i data-lucide="check-circle-2"></i> Verified</span>` : ''}
                            </div>
                            <div class="proximity-indicator">
                                ${geographicalDistanceMetricHTML}
                            </div>
                        </div>

                        <div class="stats-metric-line">
                            <div class="rating-box">
                                <i data-lucide="star"></i>
                                <span>${expert.rating}</span>
                            </div>
                            <span class="metric-divider">|</span>
                            <span>${expert.reviews} reviews</span>
                            <span class="metric-divider">|</span>
                            <span>${expert.experience}</span>
                        </div>

                        <div class="specialty-pill-box">
                            ${expert.specialties.map(specName => `<span class="pill-badge">${specName}</span>`).join('')}
                        </div>

                        <p class="profile-summary-bio">${expert.bio}</p>

                        <div class="action-buttons-group">
                            <button class="btn-action primary-btn"><i data-lucide="calendar"></i> Book Session</button>
                            <button class="btn-action secondary-btn">View Profile</button>
                        </div>
                    </div>
                </div>
            </div>`;
        
        UI.container.insertAdjacentHTML("beforeend", singleExpertMarkupCard);
    });

    // Rerender icons matching dataset updates
    lucide.createIcons();
}

/**
 * Filter Pipeline Controller
 */
function applyPipelineFiltersAndSorting() {
    let outputDataset = [...EXPERTS_DATASET];

    // 1. Process Specialties Tag selection matching
    if (currentSpecialtyFilter !== "all") {
        outputDataset = outputDataset.filter(expert => 
            expert.specialties.includes(currentSpecialtyFilter)
        );
    }

    // 2. Process Input Field Query criteria matching
    if (searchStringQuery.trim() !== "") {
        const lowerCaseQuery = searchStringQuery.toLowerCase();
        outputDataset = outputDataset.filter(expert => 
            expert.name.toLowerCase().includes(lowerCaseQuery) ||
            expert.specialties.some(spec => spec.toLowerCase().includes(lowerCaseQuery))
        );
    }

    // 3. Process Geolocation Sort calculations
    if (orderNearestActive && clientUserCoordinates) {
        outputDataset.sort((posA, posB) => {
            const distanceA = determineHaversineKilometers(
                clientUserCoordinates.lat, clientUserCoordinates.lng,
                posA.coordinates.lat, posA.coordinates.lng
            );
            const distanceB = determineHaversineKilometers(
                clientUserCoordinates.lat, clientUserCoordinates.lng,
                posB.coordinates.lat, posB.coordinates.lng
            );
            return distanceA - distanceB;
        });
    }

    displayExpertsList(outputDataset);
}

/**
 * Haversine Geometric Spherical Distance Formula
 */
function determineHaversineKilometers(lat1, lon1, lat2, lon2) {
    const EarthRadiusKm = 6371;
    const differentialLatRad = (lat2 - lat1) * Math.PI / 180;
    const differentialLonRad = (lon2 - lon1) * Math.PI / 180;
    
    const internalChordLength = 
        Math.sin(differentialLatRad / 2) * Math.sin(differentialLatRad / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(differentialLonRad / 2) * Math.sin(differentialLonRad / 2);
    
    const angularDistanceRad = 2 * Math.atan2(Math.sqrt(internalChordLength), Math.sqrt(1 - internalChordLength));
    return EarthRadiusKm * angularDistanceRad;
}

/**
 * Interactive Event Listeners Subsystem Declarations
 */
function mountCoreEventListeners() {
    // Input Key Typing Tracker
    UI.searchInput.addEventListener("input", (evt) => {
        searchStringQuery = evt.target.value;
        applyPipelineFiltersAndSorting();
    });

    // Tag Filter Event Bubble Capture Logic
    UI.filterContainer.addEventListener("click", (evt) => {
        const targetBtn = evt.target.closest(".tag");
        if (!targetBtn) return;

        // Toggle Visual Active Class states across elements
        UI.filterContainer.querySelectorAll(".tag").forEach(b => b.classList.remove("active"));
        targetBtn.classList.add("active");

        currentSpecialtyFilter = targetBtn.dataset.specialty;
        applyPipelineFiltersAndSorting();
    });

    // Proximity Filter Click Tracker
    UI.nearMeButton.addEventListener("click", () => {
        if (orderNearestActive) {
            // Disable filter toggled condition
            orderNearestActive = false;
            UI.nearMeButton.classList.remove("active-filter");
            applyPipelineFiltersAndSorting();
            return;
        }

        // Attempt core location check matching logic framework
        if (!navigator.geolocation) {
            triggerAlertDisplay("Your modern browser sandbox does not explicitly support hardware geolocation tracking API features.");
            return;
        }

        UI.nearMeButton.textContent = "Locating...";
        
        navigator.geolocation.getCurrentPosition(
            (geoFrame) => {
                clientUserCoordinates = {
                    lat: geoFrame.coords.latitude,
                    lng: geoFrame.coords.longitude
                };
                UI.errorBanner.style.display = "none";
                orderNearestActive = true;
                UI.nearMeButton.innerHTML = `<i data-lucide="map-pin"></i> Sorting Nearest`;
                UI.nearMeButton.classList.add("active-filter");
                lucide.createIcons();
                applyPipelineFiltersAndSorting();
            },
            (err) => {
                UI.nearMeButton.innerHTML = `<i data-lucide="map-pin"></i> Near Me`;
                if (err.code === err.PERMISSION_DENIED) {
                    triggerAlertDisplay("Location tracking requests denied. Please verify application profile permission configurations.");
                } else {
                    triggerAlertDisplay("Position lookup timed out or hardware system returned coordinates failure.");
                }
            },
            { enableHighAccuracy: true, timeout: 5000 }
        );
    });
}

function triggerAlertDisplay(errorStringContext) {
    UI.errorMessageText.textContent = errorStringContext;
    UI.errorBanner.style.display = "flex";
}

// Global Core Context Self-Initialization Sequence
document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
    mountCoreEventListeners();
    displayExpertsList(EXPERTS_DATASET);
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
