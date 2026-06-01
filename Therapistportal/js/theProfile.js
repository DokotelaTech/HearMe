const API_BASE = '/api';

/* =========================================
   1. TAB NAVIGATION LOGIC
========================================= */
function openTab(evt, tabName) {
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));

    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => btn.classList.remove('active'));

    document.getElementById(tabName).classList.add('active');
    evt.currentTarget.classList.add('active');
}

/* =========================================
   2. AUTHENTICATION & FETCH DATA
========================================= */
document.addEventListener('DOMContentLoaded', async () => {
    const currentToken = localStorage.getItem('token');
    const userString = localStorage.getItem('user');

    if (!currentToken || !userString) {
        window.location.href = 'login.html';
        return;
    }

    const user = JSON.parse(userString);

    if (user.role !== 'therapist') {
        window.location.href = 'dashboard.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/users/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load profile');
        }

        const therapistData = await response.json();
        populateProfile(therapistData);

    } catch (error) {
        console.error(error);
        document.getElementById('hero-name').textContent = "Error loading profile";
    }

    // Wire profile image upload input (id from HTML: profile-image-upload)
    const imageInput = document.getElementById('profile-image-upload');
    if (imageInput) {
        imageInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const result = await uploadProfileImage(file);

                // Update all avatar elements with the real image
                const avatarEls = document.querySelectorAll('#nav-avatar, #hero-main-avatar');
                avatarEls.forEach(el => {
                    el.style.backgroundImage = `url(${result.profileImage})`;
                    el.style.backgroundSize = 'cover';
                    el.style.backgroundPosition = 'center';
                    el.textContent = '';
                });

            } catch (error) {
                alert('Failed to upload profile image. Please try again.');
                console.error(error);
            }
        });
    }
});

/* =========================================
   3. FILE UPLOAD HELPERS
========================================= */
async function uploadProfileImage(file) {
    const formData = new FormData();
    formData.append('profileImage', file);

    const response = await fetch(`${API_BASE}/upload/profile-image`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
            // No Content-Type header — browser sets it automatically for FormData
        },
        body: formData
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Image upload failed');
    }

    return await response.json();
}

async function uploadCredentialFile(file) {
    const formData = new FormData();
    formData.append('credential', file);

    const response = await fetch(`${API_BASE}/upload/credential`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Credential upload failed');
    }

    return await response.json();
}

/* =========================================
   4. INJECT DATA INTO HTML
========================================= */
function populateProfile(data) {
    const fullName = `${data.firstName} ${data.lastName}`;
    const initials = `${data.firstName.charAt(0)}${data.lastName.charAt(0)}`.toUpperCase();

    document.getElementById('nav-name').textContent = fullName;
    document.getElementById('hero-name').textContent = fullName;

    // If a profile image exists, show it — otherwise show initials
    const avatarEls = document.querySelectorAll('#nav-avatar, #hero-main-avatar');
    if (data.profileImage) {
        avatarEls.forEach(el => {
            el.style.backgroundImage = `url(${data.profileImage})`;
            el.style.backgroundSize = 'cover';
            el.style.backgroundPosition = 'center';
            el.textContent = '';
        });
    } else {
        avatarEls.forEach(el => {
            el.textContent = initials;
        });
    }

    document.getElementById('nav-role').textContent = data.qualification || 'Therapist';
    document.getElementById('hero-title').textContent = data.qualification || 'Therapist';

    if (data.specialization) {
        const tagsContainer = document.getElementById('hero-tags');
        tagsContainer.innerHTML = '';
        const specs = data.specialization.split(',');
        specs.forEach(spec => {
            const span = document.createElement('span');
            span.textContent = spec.trim();
            tagsContainer.appendChild(span);
        });

        // Also populate the spec display section
        const tags = specs.map(tag =>
            `<span style="background:#e0e7ff; color:#4f46e5; padding:4px 10px; border-radius:12px; font-size:12px; margin-right:5px; display:inline-block; margin-bottom:5px;">${tag.trim()}</span>`
        ).join('');
        document.getElementById('spec-display').innerHTML = `<div>${tags}</div>`;
        markStepComplete('spec');
    }

    if (data.qualification && data.institutionName && data.licenseNumber) {
        renderCredentialsUI(
            data.qualification,
            data.institutionName,
            data.licenseNumber,
            data.credentialDocument || null
        );
        markStepComplete('cred');
    }

    if (data.bio) {
        document.getElementById('bio-display').innerHTML = `<p>${data.bio}</p>`;
        document.getElementById('bio-input').value = data.bio;
        markStepComplete('bio');
    }

    if (data.approach) {
        document.getElementById('approach-display').innerHTML = `<p>${data.approach}</p>`;
        document.getElementById('approach-input').value = data.approach;
        markStepComplete('approach');
    }

    if (data.sessionPrice && data.sessionDuration) {
        document.getElementById('session-display').innerHTML = `
            <p><i class="fa-solid fa-money-bill-wave" style="color: purple;"></i> <strong>R${data.sessionPrice}</strong> per session</p>
            <p><i class="fa-regular fa-clock" style="color:var(--purple); width:20px;"></i> <strong>${data.sessionDuration} minutes</strong></p>
            <p><i class="fa-solid fa-laptop-medical" style="color:var(--purple); width:20px;"></i> ${data.sessionEnvironment || ''}</p>
        `;
        markStepComplete('session');
    }

    if (data.profileStatus === 'verifying') {
        document.getElementById('onboarding-tracker').style.display = 'none';
        const badge = document.getElementById('hero-status');
        badge.className = 'status-badge verifying';
        badge.innerHTML = '<i class="fa-solid fa-clock-rotate-left"></i> Verifying...';
        document.getElementById('verification-message').innerText =
            "Your profile has been sent to the admin. You will be notified once approved.";
    }

    if (data.profileStatus === 'verified') {
        document.getElementById('onboarding-tracker').style.display = 'none';
        const badge = document.getElementById('hero-status');
        badge.className = 'status-badge verified';
        badge.innerHTML = '<i class="fa-solid fa-circle-check"></i> Verified';
        document.getElementById('verification-message').innerText =
            "Your profile has been verified and is now active.";
    }
}

/* =========================================
   5. ONBOARDING & EDIT LOGIC
========================================= */
const profileProgress = {
    bio: false,
    spec: false,
    approach: false,
    session: false,
    cred: false
};

function toggleEdit(section) {
    document.getElementById(`${section}-display`).classList.add('hidden');
    document.getElementById(`${section}-edit`).classList.remove('hidden');
}

async function saveSection(section) {
    let updateData = {};
    let displayHtml = '';

    if (section === 'bio') {
        const val = document.getElementById('bio-input').value.trim();
        if (!val) return alert('Bio is required');
        updateData.bio = val;
        displayHtml = `<p>${val}</p>`;

    } else if (section === 'spec') {
        const val = document.getElementById('spec-input').value.trim();
        if (!val) return alert('Specializations are required');
        updateData.specialization = val;
        const tags = val.split(',').map(tag =>
            `<span style="background:#e0e7ff; color:#4f46e5; padding:4px 10px; border-radius:12px; font-size:12px; margin-right:5px; display:inline-block; margin-bottom:5px;">${tag.trim()}</span>`
        ).join('');
        displayHtml = `<div>${tags}</div>`;

        // Update hero tags too
        const tagsContainer = document.getElementById('hero-tags');
        tagsContainer.innerHTML = '';
        val.split(',').forEach(spec => {
            const span = document.createElement('span');
            span.textContent = spec.trim();
            tagsContainer.appendChild(span);
        });

    } else if (section === 'approach') {
        const val = document.getElementById('approach-input').value.trim();
        if (!val) return alert('Treatment approach is required');
        updateData.approach = val;
        displayHtml = `<p>${val}</p>`;

    } else if (section === 'session') {
        const price = document.getElementById('session-price').value;
        const time = document.getElementById('session-time').value;
        const env = document.getElementById('session-env').value;
        if (!price || !time) return alert('Price and duration are required');

        updateData.sessionPrice = price;
        updateData.sessionDuration = time;
        updateData.sessionEnvironment = env;

        displayHtml = `
            <p><i class="fa-solid fa-dollar-sign" style="color:var(--purple); width:20px;"></i> <strong>$${price}</strong> per session</p>
            <p><i class="fa-regular fa-clock" style="color:var(--purple); width:20px;"></i> <strong>${time} minutes</strong></p>
            <p><i class="fa-solid fa-laptop-medical" style="color:var(--purple); width:20px;"></i> ${env}</p>
        `;
    }

    try {
        const response = await fetch(`${API_BASE}/users/update`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (!response.ok) throw new Error('Update failed');

        document.getElementById(`${section}-edit`).classList.add('hidden');
        const displayContainer = document.getElementById(`${section}-display`);
        displayContainer.innerHTML = displayHtml;
        displayContainer.classList.remove('hidden');

        markStepComplete(section);

    } catch (error) {
        alert("Error saving data. Please try again.");
        console.error(error);
    }
}

/* =========================================
   6. CREDENTIAL LOGIC & UI
========================================= */
async function saveCredentials() {
    const qualification = document.getElementById('cred-qualification').value.trim();
    const institution = document.getElementById('cred-institution').value.trim();
    const license = document.getElementById('cred-license').value.trim();
    const fileInput = document.getElementById('cred-file');
    const file = fileInput?.files[0];

    if (!qualification || !institution || !license) {
        return alert("Please fill out your qualification, institution, and license number.");
    }

    if (!file) {
        return alert("Please upload your credential PDF.");
    }

    try {
        // Step 1: Upload PDF to Cloudinary
        const uploadResult = await uploadCredentialFile(file);

        // Step 2: Save all credential fields + document URL to DB
        const response = await fetch(`${API_BASE}/users/update`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                qualification,
                institutionName: institution,
                licenseNumber: license,
                credentialDocument: uploadResult.credentialDocument
            })
        });

        if (!response.ok) throw new Error('Update failed');

        renderCredentialsUI(qualification, institution, license, uploadResult.credentialDocument);
        markStepComplete('cred');

    } catch (error) {
        alert("Error saving credentials. Please try again.");
        console.error(error);
    }
}

function renderCredentialsUI(qualification, institution, license, documentUrl) {
    document.getElementById('credentials-edit').classList.add('hidden');

    const displayContainer = document.getElementById('credentials-display');
    displayContainer.innerHTML = `
        <div class="cred-card">
            <div class="section-header">
                <h4><i class="fa-solid fa-graduation-cap" style="color:#16a34a; margin-right:8px;"></i> ${qualification}</h4>
                <button class="edit-btn" onclick="toggleEdit('credentials')">
                    <i class="fa-solid fa-pen"></i> Edit
                </button>
            </div>
            <p style="margin:5px 0 0 0; color:var(--muted); font-size:14px;">${institution}</p>
            <p style="margin:10px 0 0 0; font-size:13px; color:#1e293b;">
                <strong>License:</strong> ${license}
            </p>
            ${documentUrl ? `
                <a href="${documentUrl}" target="_blank"
                   style="margin:10px 0 0 0; font-size:12px; color:#3b82f6; display:block; text-decoration:none;">
                    <i class="fa-solid fa-paperclip"></i> View Uploaded Document
                </a>` : `
                <p style="margin:10px 0 0 0; font-size:12px; color:#94a3b8;">
                    <i class="fa-solid fa-paperclip"></i> No document uploaded
                </p>`
            }
        </div>
    `;
    displayContainer.classList.remove('hidden');
}

/* =========================================
   7. ONBOARDING TRACKER & SUBMISSION
========================================= */
function markStepComplete(step) {
    profileProgress[step] = true;

    const checkItem = document.getElementById(`step-${step}`);
    if (checkItem) {
        checkItem.classList.remove('pending');
        checkItem.classList.add('completed');
        // Preserve text, just update icon
        const label = checkItem.textContent.trim();
        checkItem.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${label}`;
    }

    checkIfAllComplete();
}

function checkIfAllComplete() {
    const allDone = Object.values(profileProgress).every(status => status === true);
    if (allDone) {
        const btn = document.getElementById('submit-verification-btn');
        btn.disabled = false;
        btn.classList.remove('disabled');
        btn.innerText = "Submit Profile for Admin Verification";
        btn.onclick = submitToAdmin;
    }
}

async function submitToAdmin() {
    try {
        const response = await fetch(`${API_BASE}/users/update`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ profileStatus: 'verifying' })
        });

        if (!response.ok) throw new Error('Submission failed');

        document.getElementById('onboarding-tracker').style.display = 'none';

        const badge = document.getElementById('hero-status');
        badge.className = 'status-badge verifying';
        badge.innerHTML = '<i class="fa-solid fa-clock-rotate-left"></i> Verifying...';

        document.getElementById('verification-message').innerText =
            "Your profile has been sent to the admin. You will be notified once approved.";

        alert("Success! Your profile is now under review.");

    } catch (error) {
        alert("Submission error. Please try again.");
        console.error(error);
    }
}