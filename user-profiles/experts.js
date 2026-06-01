const API_BASE = '/api';
const token = localStorage.getItem('token');

// App state
let allTherapists = [];
let currentFilter = 'all';
let searchQuery = '';
let clientCoordinates = null;
let nearMeActive = false;
let selectedTherapistId = null;

// UI elements
const UI = {
    container: document.getElementById('experts-container'),
    searchInput: document.getElementById('search-input'),
    filterContainer: document.getElementById('specialty-filters'),
    nearMeButton: document.getElementById('near-me-btn'),
    errorBanner: document.getElementById('location-error'),
    errorText: document.getElementById('location-error-text'),
    modalOverlay: document.getElementById('modal-overlay'),
    bookingModal: document.getElementById('booking-modal'),
    closeModalBtn: document.getElementById('close-modal-btn'),
    modalTherapistName: document.getElementById('modal-therapist-name'),
    bookingForm: document.getElementById('booking-form'),
    bookingSuccess: document.getElementById('booking-success'),
    successTherapistName: document.getElementById('success-therapist-name')
};

// =========================================
// FETCH VERIFIED THERAPISTS FROM DATABASE
// =========================================
async function fetchTherapists() {
    try {
        const res = await fetch(`${API_BASE}/therapist/verified`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        allTherapists = data.therapists || [];

        buildSpecialtyFilters();
        renderTherapists(allTherapists);
    } catch (error) {
        UI.container.innerHTML = '<div class="no-results-msg"><p>Failed to load therapists. Please try again.</p></div>';
        console.error('Fetch therapists error:', error);
    }
}

// =========================================
// BUILD SPECIALTY FILTER TAGS FROM REAL DATA
// =========================================
function buildSpecialtyFilters() {
    const specializations = [...new Set(allTherapists.map(t => t.specialization).filter(Boolean))];

    const existingAll = UI.filterContainer.querySelector('[data-specialty="all"]');
    UI.filterContainer.innerHTML = '';

    const allBtn = document.createElement('button');
    allBtn.className = 'tag active';
    allBtn.dataset.specialty = 'all';
    allBtn.textContent = 'All Specialties';
    UI.filterContainer.appendChild(allBtn);

    specializations.forEach(spec => {
        const btn = document.createElement('button');
        btn.className = 'tag';
        btn.dataset.specialty = spec;
        btn.textContent = spec;
        UI.filterContainer.appendChild(btn);
    });
}

// =========================================
// RENDER THERAPIST CARDS
// =========================================
function renderTherapists(therapists) {
    UI.container.innerHTML = '';

    if (!therapists || therapists.length === 0) {
        UI.container.innerHTML = `
            <div class="no-results-msg">
                <i data-lucide="search-code"></i>
                <p>No verified professionals found matching those criteria.</p>
            </div>`;
        lucide.createIcons();
        return;
    }

    const colors = ['avatar-pink', 'avatar-purple', 'avatar-blue', 'avatar-green'];

    therapists.forEach((t, i) => {
        const initials = `${t.firstName?.charAt(0) || ''}${t.lastName?.charAt(0) || ''}`;
        const colorClass = colors[i % colors.length];

        let distanceHTML = '<span class="dist-val remote"><i data-lucide="globe"></i> Remote Available</span>';
        if (clientCoordinates && t.coordinates) {
            const km = haversineDistance(
                clientCoordinates.lat, clientCoordinates.lng,
                t.coordinates.lat, t.coordinates.lng
            );
            distanceHTML = `<span class="dist-val"><i data-lucide="map-pin"></i> ${km.toFixed(1)} km away</span>`;
        }

        const card = `
            <div class="expert-card" data-id="${t._id}">
                <div class="card-layout-wrapper">
                    <div class="card-aside">
                        <div class="expert-avatar ${colorClass}">
                            ${t.profileImage
                                ? `<img src="${t.profileImage}" alt="${t.firstName}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`
                                : initials}
                        </div>
                        <span class="verified-badge"><i data-lucide="check-circle-2"></i> Verified</span>
                    </div>

                    <div class="card-body">
                        <div class="card-meta-header">
                            <div class="title-row">
                                <h3>${t.firstName} ${t.lastName}</h3>
                            </div>
                            <div class="proximity-indicator">${distanceHTML}</div>
                        </div>

                        <div class="stats-metric-line">
                            <span>${t.qualification || 'N/A'}</span>
                            <span class="metric-divider">|</span>
                            <span>${t.institutionName || 'N/A'}</span>
                            <span class="metric-divider">|</span>
                            <span><i data-lucide="map-pin"></i> ${t.location || 'N/A'}</span>
                        </div>

                        <div class="specialty-pill-box">
                            <span class="pill-badge">${t.specialization || 'General'}</span>
                        </div>

                        <p class="profile-summary-bio">${t.bio || 'No bio available.'}</p>

                        <div class="session-info">
                            <span><i data-lucide="clock"></i> ${t.sessionDuration || 'N/A'} mins</span>
                            <span><i data-lucide="dollar-sign"></i> R${t.sessionPrice || 'N/A'} / session</span>
                            <span><i data-lucide="video"></i> ${t.sessionEnvironment || 'N/A'}</span>
                        </div>

                        <div class="action-buttons-group">
                            <button class="btn-action primary-btn" onclick="openBookingModal('${t._id}', '${t.firstName} ${t.lastName}')">
                                <i data-lucide="calendar"></i> Book Session
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;

        UI.container.insertAdjacentHTML('beforeend', card);
    });

    lucide.createIcons();
}

// =========================================
// FILTER + SEARCH PIPELINE
// =========================================
function applyFilters() {
    let filtered = [...allTherapists];

    if (currentFilter !== 'all') {
        filtered = filtered.filter(t => t.specialization === currentFilter);
    }

    if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(t =>
            `${t.firstName} ${t.lastName}`.toLowerCase().includes(q) ||
            t.specialization?.toLowerCase().includes(q) ||
            t.location?.toLowerCase().includes(q)
        );
    }

    if (nearMeActive && clientCoordinates) {
        filtered.sort((a, b) => {
            if (!a.coordinates || !b.coordinates) return 0;
            const dA = haversineDistance(clientCoordinates.lat, clientCoordinates.lng, a.coordinates.lat, a.coordinates.lng);
            const dB = haversineDistance(clientCoordinates.lat, clientCoordinates.lng, b.coordinates.lat, b.coordinates.lng);
            return dA - dB;
        });
    }

    renderTherapists(filtered);
}

// =========================================
// BOOKING MODAL
// =========================================
function openBookingModal(therapistId, therapistName) {
    selectedTherapistId = therapistId;
    UI.modalTherapistName.textContent = therapistName;
    UI.bookingForm.style.display = 'block';
    UI.bookingSuccess.style.display = 'none';
    UI.bookingModal.classList.add('active');
    UI.modalOverlay.classList.add('active');
}

function closeBookingModal() {
    UI.bookingModal.classList.remove('active');
    UI.modalOverlay.classList.remove('active');
    selectedTherapistId = null;
}

UI.closeModalBtn.addEventListener('click', closeBookingModal);
UI.modalOverlay.addEventListener('click', closeBookingModal);

// =========================================
// SUBMIT BOOKING (PAYFAST INTEGRATION)
// =========================================
UI.bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const date = document.getElementById('booking-date').value;
    const time = document.getElementById('booking-time').value;
    const type = document.getElementById('booking-type').value;
    const note = document.getElementById('booking-note').value;
    const submitBtn = UI.bookingForm.querySelector('.submit-btn');

    submitBtn.textContent = 'Processing...';
    submitBtn.disabled = true;

    try {
        // Initiate payment
        const res = await fetch(`${API_BASE}/payments/initiate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                therapistId: selectedTherapistId,
                date,
                time,
                type,
                note
            })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        // Build PayFast form and auto-submit
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.paymentUrl;

        Object.entries(data.pfData).forEach(([key, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value;
            form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();

    } catch (error) {
        alert('Booking failed: ' + error.message);
        submitBtn.textContent = 'Confirm Booking';
        submitBtn.disabled = false;
    }
});

// =========================================
// HAVERSINE DISTANCE
// =========================================
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// =========================================
// EVENT LISTENERS
// =========================================
UI.searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    applyFilters();
});

UI.filterContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.tag');
    if (!btn) return;
    UI.filterContainer.querySelectorAll('.tag').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.specialty;
    applyFilters();
});

UI.nearMeButton.addEventListener('click', () => {
    if (nearMeActive) {
        nearMeActive = false;
        UI.nearMeButton.innerHTML = '<i data-lucide="map-pin"></i> Near Me';
        UI.nearMeButton.classList.remove('active-filter');
        lucide.createIcons();
        applyFilters();
        return;
    }

    if (!navigator.geolocation) {
        UI.errorText.textContent = 'Geolocation is not supported by your browser.';
        UI.errorBanner.style.display = 'flex';
        return;
    }

    UI.nearMeButton.textContent = 'Locating...';
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            clientCoordinates = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            UI.errorBanner.style.display = 'none';
            nearMeActive = true;
            UI.nearMeButton.innerHTML = '<i data-lucide="map-pin"></i> Sorting Nearest';
            UI.nearMeButton.classList.add('active-filter');
            lucide.createIcons();
            applyFilters();
        },
        (err) => {
            UI.nearMeButton.innerHTML = '<i data-lucide="map-pin"></i> Near Me';
            UI.errorText.textContent = 'Location access denied. Please enable location permissions.';
            UI.errorBanner.style.display = 'flex';
        },
        { enableHighAccuracy: true, timeout: 5000 }
    );
});

// =========================================
// INIT
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    fetchTherapists();
});