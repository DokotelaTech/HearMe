const API_BASE = '/api';

/* =========================================
   1. TAB NAVIGATION
========================================= */
function openTab(evt, tabName) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    evt.currentTarget.classList.add('active');

    if (tabName === 'Reviews') loadReviews();
}

/* =========================================
   2. INIT ON DOM READY
========================================= */
document.addEventListener('DOMContentLoaded', async () => {
    const currentToken = localStorage.getItem('token');
    const userString   = localStorage.getItem('user');

    if (!currentToken || !userString) { window.location.href = '/login'; return; }

    const user = JSON.parse(userString);
    if (user.role !== 'therapist') { window.location.href = '/dashboard'; return; }

    try {
        const response = await fetch(`${API_BASE}/users/profile`, {
            method:  'GET',
            headers: { 'Authorization': `Bearer ${currentToken}`, 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Failed to load profile');
        const data = await response.json();
        populateProfile(data);
    } catch (error) {
        console.error(error);
        document.getElementById('hero-name').textContent = 'Error loading profile';
    }

    /* Profile image upload */
    document.getElementById('profile-image-upload')?.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const result = await uploadProfileImage(file);
            setAvatarImage(result.profileImage);
        } catch {
            alert('Failed to upload profile image. Please try again.');
        }
    });
});

/* =========================================
   3. FILE UPLOAD HELPERS
========================================= */
async function uploadProfileImage(file) {
    const formData = new FormData();
    formData.append('profileImage', file);
    const response = await fetch(`${API_BASE}/upload/profile-image`, {
        method:  'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body:    formData
    });
    if (!response.ok) { const e = await response.json(); throw new Error(e.message || 'Image upload failed'); }
    return response.json();
}

async function uploadCredentialFile(file) {
    const formData = new FormData();
    formData.append('credential', file);
    const response = await fetch(`${API_BASE}/upload/credential`, {
        method:  'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body:    formData
    });
    if (!response.ok) { const e = await response.json(); throw new Error(e.message || 'Credential upload failed'); }
    return response.json();
}

/* =========================================
   4. AVATAR HELPER
========================================= */
function setAvatarImage(imageUrl, initials) {
    const avatarEls = document.querySelectorAll('#nav-avatar, #hero-main-avatar');
    if (imageUrl) {
        avatarEls.forEach(el => {
            el.style.backgroundImage    = `url(${imageUrl})`;
            el.style.backgroundSize     = 'cover';
            el.style.backgroundPosition = 'center';
            el.textContent = '';
        });
    } else if (initials) {
        avatarEls.forEach(el => {
            el.style.backgroundImage = '';
            el.textContent = initials;
        });
    }
}

/* =========================================
   5. POPULATE PROFILE DATA
========================================= */
function populateProfile(data) {
    const fullName = `${data.firstName} ${data.lastName}`;
    const initials = `${(data.firstName || '?').charAt(0)}${(data.lastName || '?').charAt(0)}`.toUpperCase();

    document.getElementById('nav-name').textContent  = fullName;
    document.getElementById('hero-name').textContent = fullName;

    setAvatarImage(data.profileImage, initials);

    document.getElementById('nav-role').textContent   = data.qualification || 'Therapist';
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
        const tags = specs.map(tag =>
            `<span style="background:#e0e7ff;color:#4f46e5;padding:4px 10px;border-radius:12px;font-size:12px;margin:2px 4px 2px 0;display:inline-block;">${tag.trim()}</span>`
        ).join('');
        document.getElementById('spec-display').innerHTML = `<div>${tags}</div>`;
        markStepComplete('spec');
    }

    /* Credentials — prefer credentialDocument from DB (uploaded at signup or later) */
    if (data.qualification && data.institutionName && data.licenseNumber) {
        const docUrl = data.credentialDocument || null;
        renderCredentialsUI(data.qualification, data.institutionName, data.licenseNumber, docUrl);
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
            <p><i class="fa-solid fa-money-bill-wave" style="color:#a855f7;"></i>&nbsp;<strong>R${data.sessionPrice}</strong> per session</p>
            <p style="margin-top:6px;"><i class="fa-regular fa-clock" style="color:#a855f7;width:18px;"></i>&nbsp;<strong>${data.sessionDuration} minutes</strong></p>
            <p style="margin-top:6px;"><i class="fa-solid fa-laptop-medical" style="color:#a855f7;width:18px;"></i>&nbsp;${data.sessionEnvironment || ''}</p>`;
        markStepComplete('session');
    }

    if (data.profileStatus === 'verifying') {
        document.getElementById('onboarding-tracker').style.display = 'none';
        document.getElementById('hero-status').className = 'status-badge verifying';
        document.getElementById('hero-status').innerHTML = '<i class="fa-solid fa-clock-rotate-left"></i> Verifying...';
        document.getElementById('verification-message').textContent =
            'Your profile has been sent to the admin. You will be notified once approved.';
    }
    if (data.profileStatus === 'verified') {
        document.getElementById('onboarding-tracker').style.display = 'none';
        document.getElementById('hero-status').className = 'status-badge verified';
        document.getElementById('hero-status').innerHTML = '<i class="fa-solid fa-circle-check"></i> Verified';
        document.getElementById('verification-message').textContent =
            'Your profile has been verified and is now active.';
    }
}

/* =========================================
   6. LOAD REVIEWS
========================================= */
async function loadReviews() {
    const container = document.getElementById('reviews-container');
    const token     = localStorage.getItem('token');

    /* Show skeleton */
    container.innerHTML = `
        <div class="review-skeleton"></div>
        <div class="review-skeleton" style="height:70px;opacity:0.6;"></div>`;

    try {
        const res = await fetch(`${API_BASE}/therapist/reviews`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Could not fetch reviews');
        const data = await res.json();
        const reviews = data.reviews || [];

        /* Update tab label */
        document.getElementById('tab-reviews-btn').textContent = `Reviews (${reviews.length})`;

        if (reviews.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-regular fa-star"></i>
                    <p>No reviews yet. Reviews from clients will appear here after completed sessions.</p>
                </div>`;
            document.getElementById('reviews-summary').style.display = 'none';
            return;
        }

        /* Build summary stats */
        const avg   = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
        const dist  = [0, 0, 0, 0, 0]; // index 0=1-star ... 4=5-star
        reviews.forEach(r => { if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++; });

        /* Show summary */
        const summaryEl = document.getElementById('reviews-summary');
        summaryEl.style.display = 'flex';
        document.getElementById('avg-rating').textContent = avg.toFixed(1);
        document.getElementById('avg-stars').innerHTML    = buildStarHTML(avg);
        document.getElementById('total-count').textContent = `${reviews.length} review${reviews.length !== 1 ? 's' : ''}`;

        /* Rating distribution bars */
        const barsEl = document.getElementById('rating-bars');
        barsEl.innerHTML = [5, 4, 3, 2, 1].map(star => {
            const count = dist[star - 1];
            const pct   = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
            return `
                <div class="rating-bar-row">
                    <span class="bar-label">${star} ★</span>
                    <div class="rating-bar-track">
                        <div class="rating-bar-fill" style="width:${pct}%"></div>
                    </div>
                    <span class="bar-count">${count}</span>
                </div>`;
        }).join('');

        /* Update satisfaction metric in hero */
        const satisfied = reviews.filter(r => r.rating >= 4).length;
        const satPct    = reviews.length ? Math.round((satisfied / reviews.length) * 100) : 0;
        document.getElementById('metric-satisfaction').textContent = `${satPct}%`;

        /* Update sessions metric */
        document.getElementById('metric-sessions').textContent = reviews.length;

        /* Render review cards */
        container.innerHTML = reviews
            .slice()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map(r => renderReviewCard(r))
            .join('');

    } catch (err) {
        console.error('Reviews load error:', err);
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-circle-exclamation" style="color:#f87171;"></i>
                <p>Could not load reviews. Please try again later.</p>
            </div>`;
    }
}

function buildStarHTML(avg) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (avg >= i)          html += '<span style="color:#f59e0b;">★</span>';
        else if (avg >= i - 0.5) html += '<span style="color:#f59e0b;">½</span>';
        else                   html += '<span style="color:#e2e8f0;">★</span>';
    }
    return html;
}

function renderReviewCard(r) {
    const name     = r.userName || r.userIdentifier || 'Anonymous User';
    const initials = name.charAt(0).toUpperCase();
    const stars    = '★'.repeat(Math.max(0, Math.min(5, r.rating))) + '☆'.repeat(5 - Math.min(5, r.rating));
    const date     = r.createdAt
        ? new Date(r.createdAt).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' })
        : '';

    return `
        <div class="review-card">
            <div class="review-card-header">
                <div class="reviewer-info">
                    <div class="reviewer-avatar">${initials}</div>
                    <div>
                        <div class="reviewer-name">${name}</div>
                        <div class="reviewer-date">${date}</div>
                    </div>
                </div>
                <div class="review-stars" aria-label="${r.rating} out of 5 stars">${stars}</div>
            </div>
            ${r.review ? `<p class="review-text">${escapeHtml(r.review)}</p>` : ''}
        </div>`;
}

function escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

/* =========================================
   7. EDIT / SAVE SECTIONS
========================================= */
const profileProgress = { bio: false, spec: false, approach: false, session: false, cred: false };

function toggleEdit(section) {
    document.getElementById(`${section}-display`)?.classList.add('hidden');
    document.getElementById(`${section}-edit`)?.classList.remove('hidden');
}

async function saveSection(section) {
    let updateData  = {};
    let displayHtml = '';

    if (section === 'bio') {
        const val = document.getElementById('bio-input').value.trim();
        if (!val) return alert('Bio is required');
        updateData.bio = val;
        displayHtml    = `<p>${val}</p>`;

    } else if (section === 'spec') {
        const val = document.getElementById('spec-input').value.trim();
        if (!val) return alert('Specializations are required');
        updateData.specialization = val;
        const tags = val.split(',').map(tag =>
            `<span style="background:#e0e7ff;color:#4f46e5;padding:4px 10px;border-radius:12px;font-size:12px;margin:2px 4px 2px 0;display:inline-block;">${tag.trim()}</span>`
        ).join('');
        displayHtml = `<div>${tags}</div>`;
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
        displayHtml         = `<p>${val}</p>`;

    } else if (section === 'session') {
        const price = document.getElementById('session-price').value;
        const time  = document.getElementById('session-time').value;
        const env   = document.getElementById('session-env').value;
        if (!price || !time) return alert('Price and duration are required');
        updateData = { sessionPrice: price, sessionDuration: time, sessionEnvironment: env };
        displayHtml = `
            <p><i class="fa-solid fa-money-bill-wave" style="color:#a855f7;"></i>&nbsp;<strong>R${price}</strong> per session</p>
            <p style="margin-top:6px;"><i class="fa-regular fa-clock" style="color:#a855f7;width:18px;"></i>&nbsp;<strong>${time} minutes</strong></p>
            <p style="margin-top:6px;"><i class="fa-solid fa-laptop-medical" style="color:#a855f7;width:18px;"></i>&nbsp;${env}</p>`;
    }

    try {
        const response = await fetch(`${API_BASE}/users/update`, {
            method:  'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        if (!response.ok) throw new Error('Update failed');

        document.getElementById(`${section}-edit`).classList.add('hidden');
        const displayEl = document.getElementById(`${section}-display`);
        displayEl.innerHTML = displayHtml;
        displayEl.classList.remove('hidden');
        markStepComplete(section);
    } catch {
        alert('Error saving data. Please try again.');
    }
}

/* =========================================
   8. CREDENTIALS
========================================= */
async function saveCredentials() {
    const qualification = document.getElementById('cred-qualification').value.trim();
    const institution   = document.getElementById('cred-institution').value.trim();
    const license       = document.getElementById('cred-license').value.trim();
    const fileInput     = document.getElementById('cred-file');
    const file          = fileInput?.files[0];

    if (!qualification || !institution || !license) {
        return alert('Please fill out your qualification, institution, and license number.');
    }
    if (!file) {
        return alert('Please upload your credential PDF or image.');
    }

    try {
        const uploadResult = await uploadCredentialFile(file);

        const response = await fetch(`${API_BASE}/users/update`, {
            method:  'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                qualification,
                institutionName:    institution,
                licenseNumber:      license,
                credentialDocument: uploadResult.credentialDocument
            })
        });
        if (!response.ok) throw new Error('Update failed');

        renderCredentialsUI(qualification, institution, license, uploadResult.credentialDocument);
        markStepComplete('cred');
    } catch (err) {
        alert('Error saving credentials. Please try again.');
        console.error(err);
    }
}

function renderCredentialsUI(qualification, institution, license, documentUrl) {
    document.getElementById('credentials-edit').classList.add('hidden');

    const displayContainer = document.getElementById('credentials-display');
    displayContainer.innerHTML = `
        <div class="cred-card">
            <div class="section-header">
                <h4><i class="fa-solid fa-graduation-cap" style="color:#16a34a;margin-right:8px;"></i>${qualification}</h4>
                <button class="edit-btn" onclick="
                    document.getElementById('credentials-display').classList.add('hidden');
                    document.getElementById('credentials-edit').classList.remove('hidden');
                "><i class="fa-solid fa-pen"></i> Edit</button>
            </div>
            <p style="margin:6px 0 0;color:#64748b;font-size:14px;">${institution}</p>
            <p style="margin:10px 0 0;font-size:13px;color:#1e293b;"><strong>License:</strong> ${license}</p>
            ${documentUrl
                ? `<a href="${documentUrl}" target="_blank" rel="noopener" class="cred-doc-link">
                        <i class="fa-solid fa-paperclip"></i> View Uploaded Document
                   </a>`
                : `<p style="margin:10px 0 0;font-size:12px;color:#94a3b8;">
                        <i class="fa-solid fa-paperclip"></i> No document uploaded
                   </p>`
            }
        </div>`;
    displayContainer.classList.remove('hidden');
}

/* =========================================
   9. ONBOARDING TRACKER
========================================= */
function markStepComplete(step) {
    profileProgress[step] = true;
    const checkItem = document.getElementById(`step-${step}`);
    if (checkItem) {
        const label = checkItem.textContent.trim().replace(/^[^\s]+\s/, '');
        checkItem.className = 'check-item completed';
        checkItem.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${label}`;
    }
    checkIfAllComplete();
}

function checkIfAllComplete() {
    const allDone = Object.values(profileProgress).every(Boolean);
    if (allDone) {
        const btn    = document.getElementById('submit-verification-btn');
        btn.disabled = false;
        btn.classList.remove('disabled');
        btn.textContent = 'Submit Profile for Admin Verification';
        btn.onclick = submitToAdmin;
    }
}

async function submitToAdmin() {
    try {
        const response = await fetch(`${API_BASE}/users/update`, {
            method:  'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ profileStatus: 'verifying' })
        });
        if (!response.ok) throw new Error('Submission failed');

        document.getElementById('onboarding-tracker').style.display = 'none';
        document.getElementById('hero-status').className = 'status-badge verifying';
        document.getElementById('hero-status').innerHTML = '<i class="fa-solid fa-clock-rotate-left"></i> Verifying...';
        document.getElementById('verification-message').textContent =
            'Your profile has been sent to the admin. You will be notified once approved.';

        alert('Success! Your profile is now under review.');
    } catch {
        alert('Submission error. Please try again.');
    }
}