/* =========================================
   1. TAB NAVIGATION LOGIC
========================================= */
function openTab(evt, tabName) {
    // Hide all tab content
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));

    // Remove 'active' class from all buttons
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => btn.classList.remove('active'));

    // Show the current tab and add 'active' class to the button
    document.getElementById(tabName).classList.add('active');
    evt.currentTarget.classList.add('active');
}

/* =========================================
   2. FETCH & POPULATE PROFILE DATA
========================================= */
document.addEventListener('DOMContentLoaded', async () => {
    // Retrieve the user data and token saved during login
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');

    if (!token || !userString) {
        alert('You must be logged in to view this page.');
        window.location.href = 'login.html';
        return;
    }

    const user = JSON.parse(userString);

    // Ensure only therapists can access this specific portal
    if (user.role !== 'therapist') {
        alert('Unauthorized access. Redirecting to user dashboard.');
        window.location.href = 'dashboard.html'; // Or whatever your user page is
        return;
    }

    try {
        // Fetch the therapist's full document from your database
        const response = await fetch(`http://localhost:5000/api/users/${user.id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load profile data');
        }

        const therapistData = await response.json();
        populateProfile(therapistData);

    } catch (error) {
        console.error('Error fetching profile:', error);
        document.getElementById('hero-name').textContent = "Error loading profile";
        document.getElementById('hero-status').innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Offline';
    }
});

/* =========================================
   3. INJECT DATA INTO HTML
========================================= */
function populateProfile(data) {
    // 1. Basic Info & Initials
    const fullName = `Dr. ${data.firstName} ${data.lastName}`;
    const initials = `${data.firstName.charAt(0)}${data.lastName.charAt(0)}`.toUpperCase();

    document.getElementById('header-name').textContent = fullName;
    document.getElementById('hero-name').textContent = fullName;
    
    document.getElementById('header-avatar').textContent = initials;
    document.getElementById('hero-main-avatar').textContent = initials;

    document.getElementById('header-title').textContent = data.qualification || 'Therapist';
    document.getElementById('hero-title').textContent = data.qualification || 'Therapist';

    // 2. Status
    const statusBadge = document.getElementById('hero-status');
    statusBadge.innerHTML = '<i class="fa-solid fa-circle-check"></i> Verified';
    statusBadge.style.backgroundColor = '#22c55e'; // Green

    // 3. Specializations (Tags)
    // Assuming specialization from signup is a comma-separated string (e.g., "Anxiety, Trauma")
    const tagsContainer = document.getElementById('hero-tags');
    tagsContainer.innerHTML = ''; // clear existing
    if (data.specialization) {
        const specs = data.specialization.split(',');
        specs.forEach(spec => {
            const span = document.createElement('span');
            span.contentEditable = "true";
            span.textContent = spec.trim();
            tagsContainer.appendChild(span);
        });
    }

    // 4. Credentials Tab
    // We map the licenseNumber and institutionName from signup to a credential card
    const credList = document.getElementById('credentials-list');
    if (data.licenseNumber && data.institutionName) {
        credList.innerHTML = `
            <div class="cred-card">
                <div class="cred-header">
                    <strong contenteditable="true">License: ${data.licenseNumber}</strong>
                    <i class="fa-solid fa-circle-check green"></i>
                </div>
                <p contenteditable="true">${data.institutionName}</p>
                <button class="remove-cred" onclick="this.parentElement.remove()">×</button>
            </div>
        `;
    } else {
        credList.innerHTML = '<p class="empty-state">No credentials added yet.</p>';
    }

    // 5. Fill out blanks for fields not yet in your DB schema
    // Since your signup didn't ask for bio, pricing, or education, we provide editable defaults
    document.getElementById('about-text').textContent = data.bio || "Click here to add your professional biography...";
    document.getElementById('approach-text').textContent = data.approach || "Click here to describe your treatment approach...";
    document.getElementById('session-price').textContent = data.price || "R0 - Update Price";
    document.getElementById('session-duration').textContent = "50-minute sessions";
    
    document.getElementById('edu-list').innerHTML = data.education ? 
        `<li>${data.education}</li>` : 
        `<li>Click to add your degree</li><li>Click to add your university</li>`;

    document.getElementById('verification-message').textContent = `License ${data.licenseNumber || 'pending'} verified by HearMe admin.`;
}

/* =========================================
   4. ADD NEW CREDENTIAL LOGIC
========================================= */
function addNewCredential() {
    const credList = document.getElementById('credentials-list');
    
    // Remove empty state text if it exists
    if (credList.querySelector('.empty-state')) {
        credList.innerHTML = '';
    }

    const newCard = document.createElement('div');
    newCard.className = 'cred-card';
    newCard.innerHTML = `
        <div class="cred-header">
            <strong contenteditable="true">New Credential Title</strong>
            <i class="fa-solid fa-circle-check" style="color: #cbd5e1;"></i>
        </div>
        <p contenteditable="true">Issuing Institution</p>
        <small contenteditable="true">Year Obtained</small>
        <button class="remove-cred" onclick="this.parentElement.remove()">×</button>
    `;
    credList.appendChild(newCard);
}