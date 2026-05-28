// UI LOGIC (Expand / Collapse composer)
const collapsed   = document.getElementById('post-collapsed');
const expanded    = document.getElementById('post-expanded');
const simpleInput = document.getElementById('post-input-simple');
const openBtn     = document.getElementById('open-composer');
const cancelBtn   = document.getElementById('cancel-post');
const postBtn     = document.getElementById('post-button');
const textarea    = document.getElementById('post-textarea');
const tabBtns     = document.querySelectorAll('.tab-btn');
const postContainer = document.getElementById('post-container');

let postType = 'struggle';

function openComposer() {
  collapsed.style.display = 'none';
  expanded.style.display  = 'block';
  textarea.focus();
}

function closeComposer() {
  expanded.style.display  = 'none';
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
      : "Share your win, big or small. Inspire others! 🌟";
  });
});

// DATABASE LOGIC
const token = localStorage.getItem('token');
const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
const currentUserIdentifier = localStorage.getItem('userIdentifier') || savedUser.identifier || 'Anonymous';

document.querySelector('.user-avatar').textContent = currentUserIdentifier ? currentUserIdentifier.charAt(0).toUpperCase() : 'U';

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
        console.error('Error:', error);
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
        card.setAttribute('data-id', post._id);
        
        const isSuccess = post.postType === 'success';
        const badgeClass = isSuccess ? 'badge-success' : 'badge-struggle';
        const badgeIcon = isSuccess ? '<i data-lucide="sparkles" style="width: 14px; height: 14px;"></i> ' : '';
        const badgeText = isSuccess ? 'Success' : 'Struggle';
        
        const likeCount = post.likes ? post.likes.length : 0;
        const commentCount = post.comments ? post.comments.length : 0;
        const isLikedByMe = post.likes && post.likes.includes(currentUserIdentifier);
        const initial = post.authorIdentifier ? post.authorIdentifier.charAt(0).toUpperCase() : 'U';

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
                    ${badgeIcon}${badgeText}
                </div>
            </div>

            <div class="post-content">
                ${post.content}
            </div>

            <div class="post-footer">
                <button class="post-action-btn like-btn" data-id="${post._id}">
                    <i data-lucide="heart" style="fill:${isLikedByMe ? '#a820c7' : 'none'}; color:${isLikedByMe ? '#a820c7' : 'currentColor'};"></i>
                    <span class="like-count">${likeCount}</span>
                </button>
                <button class="post-action-btn toggle-comments-btn" data-id="${post._id}">
                    <i data-lucide="message-square"></i> <span class="comment-count">${commentCount}</span>
                </button>
                <button class="post-action-btn report-btn" data-id="${post._id}">
                    <i data-lucide="flag"></i> Report
                </button>
            </div>

            <div class="comment-section" id="comments-${post._id}" style="display:none;">
                <div class="comments-list">
                    ${post.comments && post.comments.length > 0 ? post.comments.map(c => `
                        <div class="comment-item">
                            <span><strong>${c.userIdentifier}</strong>: ${c.text}</span>
                        </div>
                    `).join('') : '<p class="no-comments">No comments yet.</p>'}
                </div>
                <div class="comment-input-group">
                    <input type="text" class="comment-input" placeholder="Write a comment...">
                    <button class="submit-comment-btn" data-id="${post._id}">Reply</button>
                </div>
            </div>
        `;
        
        postContainer.appendChild(card);
    });

    lucide.createIcons();
}

// INTERACTION LOGIC
document.addEventListener('click', async (e) => {

    // LIKE TOGGLE
    const likeBtn = e.target.closest('.like-btn');
    if (likeBtn) {
        const postId = likeBtn.getAttribute('data-id');
        try {
            const response = await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                likeBtn.querySelector('.like-count').innerText = data.likesCount;
                const heartIcon = likeBtn.querySelector('svg');
                if (heartIcon) {
                    heartIcon.style.fill = data.isLiked ? '#a820c7' : 'none';
                    heartIcon.style.color = data.isLiked ? '#a820c7' : 'currentColor';
                }
            }
        } catch (err) { console.error('Like error:', err); }
    }

    // TOGGLE COMMENTS
    const toggleBtn = e.target.closest('.toggle-comments-btn');
    if (toggleBtn) {
        const postId = toggleBtn.getAttribute('data-id');
        const section = document.getElementById(`comments-${postId}`);
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
    }

    // SUBMIT COMMENT
    const submitBtn = e.target.closest('.submit-comment-btn');
    if (submitBtn) {
        const postId = submitBtn.getAttribute('data-id');
        const section = document.getElementById(`comments-${postId}`);
        const input = section.querySelector('.comment-input');
        const text = input.value.trim();
        if (!text) return;

        try {
            const response = await fetch(`http://localhost:5000/api/posts/${postId}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ text })
            });

            if (response.ok) {
                const data = await response.json();
                const commentsList = section.querySelector('.comments-list');
                const noComments = commentsList.querySelector('.no-comments');
                if (noComments) noComments.remove();

                const newComment = document.createElement('div');
                newComment.className = 'comment-item';
                newComment.innerHTML = `<span><strong>${currentUserIdentifier}</strong>: ${text}</span>`;
                commentsList.appendChild(newComment);
                input.value = '';

                const countEl = document.querySelector(`.toggle-comments-btn[data-id="${postId}"] .comment-count`);
                if (countEl) countEl.innerText = data.commentsCount;
            }
        } catch (err) { console.error('Comment error:', err); }
    }

    // REPORT POST — opens modal
    const reportBtn = e.target.closest('.report-btn');
    if (reportBtn) {
        const postId = reportBtn.getAttribute('data-id');
        openReportModal(postId, reportBtn);
    }
});

// CREATE NEW POST
postBtn.addEventListener('click', async () => {
    const text = textarea.value.trim();
    if (!text) return;

    postBtn.textContent = 'Posting...';
    postBtn.disabled = true;

    try {
        const response = await fetch('http://localhost:5000/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ postType, content: text })
        });

        if (response.ok) {
            closeComposer();
            fetchPosts();
        } else {
            alert('Failed to post. Please try again.');
        }
    } catch (error) {
        console.error('Error submitting post:', error);
    } finally {
        postBtn.textContent = 'Post';
        postBtn.disabled = false;
    }
});

// ========================================
// REPORT MODAL LOGIC
// ========================================

let _reportTargetPostId = null;
let _reportTargetBtn    = null;

function openReportModal(postId, btn) {
    _reportTargetPostId = postId;
    _reportTargetBtn    = btn || null;

    // Reset form
    document.querySelectorAll('input[name="reportReason"]').forEach(r => r.checked = false);
    document.getElementById('reportCustomReason').value = '';

    // Show modal
    document.getElementById('reportModal').style.display = 'flex';
}

function closeReportModal() {
    document.getElementById('reportModal').style.display = 'none';
    _reportTargetPostId = null;
    _reportTargetBtn    = null;
}

async function submitReport() {
    const selectedReason = document.querySelector('input[name="reportReason"]:checked');
    const customReason   = document.getElementById('reportCustomReason').value.trim();

    if (!selectedReason) {
        const reasons = document.querySelector('.report-reasons');
        reasons.style.animation = 'none';
        reasons.offsetHeight;
        reasons.style.animation = 'shakeModal 0.3s ease';
        return;
    }

    const category = (selectedReason.value === 'Other' && customReason)
        ? `Other: ${customReason}`
        : selectedReason.value;

    const submitBtn = document.querySelector('.btn-report-submit');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';

    try {
        const response = await fetch('http://localhost:5000/api/reports', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ category, postId: _reportTargetPostId })
        });

        if (response.ok) {
            closeReportModal();
            showReportSuccess();
            if (_reportTargetBtn) {
                _reportTargetBtn.disabled = true;
                _reportTargetBtn.style.opacity = '0.5';
            }
        } else {
            let message = 'Could not submit report. Please try again.';
            try {
                const data = await response.json();
                if (data.message) message = data.message;
            } catch (_) {}
            alert(message);
        }
    } catch (err) {
        console.error('Report error:', err);
        alert('Network error. Please check your connection and try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-flag"></i> Submit Report';
    }
}

// ========================================
// SUCCESS TOAST
// ========================================

function showReportSuccess() {
    const toast = document.createElement('div');
    toast.className = 'report-toast';
    toast.innerHTML = '<i class="fa-solid fa-circle-check"></i> Report submitted. Thank you!';
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ========================================
// INIT
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    fetchPosts();

    // Close modal when clicking backdrop
    document.getElementById('reportModal').addEventListener('click', function (e) {
        if (e.target === this) closeReportModal();
    });
});