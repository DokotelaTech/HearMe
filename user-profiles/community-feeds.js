const collapsed = document.getElementById('post-collapsed');
const expanded = document.getElementById('post-expanded');
const simpleInput = document.getElementById('post-input-simple');
const openBtn = document.getElementById('open-composer');
const cancelBtn = document.getElementById('cancel-post');
const postBtn = document.getElementById('post-button');
const textarea = document.getElementById('post-textarea');
const tabBtns = document.querySelectorAll('.tab-btn');
const postContainer = document.getElementById('post-container');

let postType = 'struggle';

function openComposer() {
    collapsed.style.display = 'none';
    expanded.style.display = 'block';
    textarea.focus();
}

function closeComposer() {
    expanded.style.display = 'none';
    collapsed.style.display = 'flex';
    textarea.value = '';
    tabBtns.forEach(b => b.classList.remove('active'));
    tabBtns[0].classList.add('active');
    postType = 'struggle';
    textarea.placeholder = "Share what you're going through... You're not alone.";
}

simpleInput.addEventListener('click', openComposer);
openBtn.addEventListener('click', openComposer);
cancelBtn.addEventListener('click', closeComposer);

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        postType = btn.dataset.type;
        textarea.placeholder = postType === 'struggle'
            ? "Share what you're going through... You're not alone."
            : "Share your win, big or small. Inspire others!";
    });
});

const token = localStorage.getItem('token');
const currentUserIdentifier = localStorage.getItem('userIdentifier');

if (!token) {
    alert('Session expired, please log in.');
    window.location.href = '/login';
}

document.querySelector('.user-avatar').textContent =
    currentUserIdentifier ? currentUserIdentifier.charAt(0).toUpperCase() : 'U';

// =========================================
// FETCH & RENDER POSTS
// =========================================
async function fetchPosts() {
    try {
        const response = await fetch('http://localhost:5000/api/posts', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const posts = await response.json();
            renderPosts(posts);
        } else {
            console.error('Failed to fetch posts');
        }
    } catch (error) {
        console.error('Fetch posts error:', error);
    }
}

function renderPosts(posts) {
    postContainer.innerHTML = '';

    if (posts.length === 0) {
        postContainer.innerHTML = '<p class="empty-state">No posts yet. Be the first to share!</p>';
        return;
    }

    posts.forEach(post => {
        const card = document.createElement('div');
        card.className = 'post-card';

        const isSuccess    = post.postType === 'success';
        const badgeClass   = isSuccess ? 'badge-success' : 'badge-struggle';
        const badgeText    = isSuccess ? 'Success' : 'Struggle';
        const likeCount    = post.likes    ? post.likes.length    : 0;
        const commentCount = post.comments ? post.comments.length : 0;
        const initial      = post.authorIdentifier ? post.authorIdentifier.charAt(0).toUpperCase() : 'U';

        card.innerHTML = `
            <div class="post-header">
                <div class="post-user-info">
                    <div class="post-avatar">${initial}</div>
                    <div class="post-meta">
                        <span class="post-username">${post.authorIdentifier}</span>
                        <span class="post-time">Just now</span>
                    </div>
                </div>
                <div class="post-badge ${badgeClass}">
                    ${isSuccess ? '<i data-lucide="sparkles" style="width:14px;height:14px;"></i> ' : ''}${badgeText}
                </div>
            </div>

            <div class="post-content">${post.content}</div>

            <div class="post-footer">
                <button class="post-action-btn like-btn" data-id="${post._id}">
                    <i data-lucide="heart"></i> <span class="like-count">${likeCount}</span>
                </button>
                <button class="post-action-btn">
                    <i data-lucide="message-square"></i> ${commentCount}
                </button>
                <button class="post-action-btn">
                    <i data-lucide="share-2"></i> Share
                </button>
                <button class="post-action-btn report-btn" data-id="${post._id}">
                    <i data-lucide="flag"></i> Report
                </button>
            </div>
        `;

        postContainer.appendChild(card);
    });

    lucide.createIcons();
}

// =========================================
// LIKE POST
// =========================================
document.addEventListener('click', async e => {
    const likeBtn = e.target.closest('.like-btn');
    if (likeBtn) {
        const postId = likeBtn.getAttribute('data-id');
        try {
            const res = await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                likeBtn.querySelector('.like-count').textContent = data.likesCount;
                likeBtn.style.color = data.isLiked ? '#a855f7' : '';
            }
        } catch (err) {
            console.error('Like error:', err);
        }
    }
});

// =========================================
// REPORT BTN CLICK
// =========================================
document.addEventListener('click', e => {
    const reportBtn = e.target.closest('.report-btn');
    if (reportBtn) {
        const postId = reportBtn.getAttribute('data-id');
        openReportModal(postId, reportBtn);
    }
});

// =========================================
// SUBMIT POST
// =========================================
postBtn.addEventListener('click', async () => {
    const text = textarea.value.trim();
    if (!text) return;

    postBtn.textContent = 'Posting...';
    postBtn.disabled = true;

    try {
        const response = await fetch('http://localhost:5000/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ postType, content: text })
        });

        if (response.ok) {
            closeComposer();
            fetchPosts();
        } else {
            alert('Failed to post. Please try again.');
        }
    } catch (error) {
        console.error('Post error:', error);
    } finally {
        postBtn.textContent = 'Post';
        postBtn.disabled = false;
    }
});

// =========================================
// REPORT MODAL
// =========================================
let reportTargetPostId = null;
let reportTargetBtn    = null;

function openReportModal(postId, btn) {
    reportTargetPostId = postId;
    reportTargetBtn    = btn || null;
    document.querySelectorAll('input[name="reportReason"]').forEach(r => r.checked = false);
    document.getElementById('reportCustomReason').value = '';
    document.getElementById('reportModal').style.display = 'flex';
    lucide.createIcons();
}

function closeReportModal() {
    document.getElementById('reportModal').style.display = 'none';
    reportTargetPostId = null;
    reportTargetBtn    = null;
}

async function submitReport() {
    const selectedReason = document.querySelector('input[name="reportReason"]:checked');
    const customReason   = document.getElementById('reportCustomReason').value.trim();

    if (!selectedReason) {
        const reasons = document.querySelector('.report-reasons');
        reasons.style.outline = '2px solid #ef4444';
        setTimeout(() => reasons.style.outline = '', 1500);
        return;
    }

    const category = selectedReason.value === 'Other' && customReason
        ? `Other: ${customReason}`
        : selectedReason.value;

    const description = customReason || selectedReason.value;

    const submitBtn = document.querySelector('.btn-report-submit');
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Submitting...';

    try {
        const response = await fetch('http://localhost:5000/api/reports', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                type: 'moderation',
                category,
                description,
                postId: reportTargetPostId
            })
        });

        if (response.ok) {
            closeReportModal();
            showReportSuccess();

            if (reportTargetBtn) {
                reportTargetBtn.disabled = true;
                reportTargetBtn.style.opacity = '0.4';
                reportTargetBtn.title = 'Already reported';
            }
        } else {
            const data = await response.json().catch(() => ({}));
            alert(data.message || 'Could not submit report. Please try again.');
        }
    } catch (err) {
        console.error('Report error:', err);
        alert('Network error. Please check your connection.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i data-lucide="flag"></i> Submit Report';
        lucide.createIcons();
    }
}

function showReportSuccess() {
    const existing = document.getElementById('report-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'report-toast';
    toast.className = 'report-toast';
    toast.textContent = 'Report submitted. Thank you for keeping the community safe!';
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Close modal on overlay click
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    fetchPosts();

    const reportModal = document.getElementById('reportModal');
    if (reportModal) {
        reportModal.addEventListener('click', e => {
            if (e.target === reportModal) closeReportModal();
        });
    }
});

// expose for onclick in HTML
window.closeReportModal = closeReportModal;
window.submitReport     = submitReport;