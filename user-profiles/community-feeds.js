<<<<<<< HEAD
// UI LOGIC (Expand / Collapse composer) - Kept exactly as you wrote it!
=======
// UI LOGIC (Expand / Collapse composer)
>>>>>>> ebb70e2 (d)
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

<<<<<<< HEAD
// DATABASE LOGIC
const token = localStorage.getItem('token');
const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
const currentUserIdentifier = localStorage.getItem('userIdentifier') || savedUser.identifier || 'Anonymous';

document.querySelector('.user-avatar').textContent = currentUserIdentifier ? currentUserIdentifier.charAt(0).toUpperCase() : 'U';

=======
// DATABASE LOGIC (Connecting to Node.js / MongoDB)

const token = localStorage.getItem('token');
const currentUserIdentifier = localStorage.getItem('userIdentifier');

if (!token) {
    alert("You need to be logged in to perform this function");
    window.location.href = 'login.html';
}

// Set the avatar letter at the top
const avatarElement = document.querySelector('.user-avatar');
if (avatarElement) {
    avatarElement.textContent = currentUserIdentifier ? currentUserIdentifier.charAt(0).toUpperCase() : 'U';
}

// Function to fetch all posts
>>>>>>> ebb70e2 (d)
async function fetchPosts() {
    try {
        const response = await fetch('http://localhost:5000/api/posts', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
<<<<<<< HEAD
=======
        
>>>>>>> ebb70e2 (d)
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

<<<<<<< HEAD
function renderPosts(posts) {
    postContainer.innerHTML = '';
    
    if (posts.length === 0) {
        postContainer.innerHTML = '<p class="empty-state">No posts yet. Be the first to share!</p>';
=======
// Function to turn MongoDB data into HTML cards
function renderPosts(posts) {
    postContainer.innerHTML = ''; 
    
    if (posts.length === 0) {
        postContainer.innerHTML = '<p style="text-align:center; color:#666;">No posts yet. Be the first to share!</p>';
>>>>>>> ebb70e2 (d)
        return;
    }

    posts.forEach(post => {
<<<<<<< HEAD
        // Create the card container
        const card = document.createElement('div');
        // Ensure this matches the CSS class for the wrapper
        card.className = 'post-card'; 
        
        // Setup styling based on Struggle vs Success
        const isSuccess = post.postType === 'success';
        const badgeClass = isSuccess ? 'badge-success' : 'badge-struggle';
        const badgeIcon = isSuccess ? '<i data-lucide="sparkles" style="width: 14px; height: 14px;"></i> ' : '';
        const badgeText = isSuccess ? 'Success' : 'Struggle';
        
        // Only show the sparkles icon if it's a success post
        const badgeIcon = isSuccess ? '<i data-lucide="sparkles" style="width: 14px; height: 14px;"></i> ' : '';
        const badgeText = isSuccess ? 'Success' : 'Struggle';
        
        // Calculate interactions
        const likeCount = post.likes ? post.likes.length : 0;
        const commentCount = post.comments ? post.comments.length : 0;
        const isLikedByMe = post.likes && post.likes.includes(currentUserIdentifier);
        const initial = post.authorIdentifier ? post.authorIdentifier.charAt(0).toUpperCase() : 'U';

        // Inject the clean, class-based HTML
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

    // Re-initialize Lucide icons for the newly injected HTML
    lucide.createIcons();
}

// INTERACTION LOGIC
document.addEventListener('click', async (e) => {

    // LIKE TOGGLE
    const likeBtn = e.target.closest('.like-btn');
    if (likeBtn) {
        const postId = likeBtn.getAttribute('data-id');
=======
        const card = document.createElement('div');
        card.className = 'post-card';
        card.setAttribute('data-id', post._id);
        
        const isSuccess = post.postType === 'success';
        const badgeColor = isSuccess ? '#e6f7ef' : '#f5e6fb';
        const badgeTextColor = isSuccess ? '#0d894f' : '#8e24aa';
        const badgeText = isSuccess ? '✨ Success' : 'Struggle';
        
        const likeCount = post.likes ? post.likes.length : 0;
        const commentCount = post.comments ? post.comments.length : 0;
        
        const isLikedByMe = post.likes && post.likes.includes(currentUserIdentifier);
        const heartFill = isLikedByMe ? '#8b5cf6' : 'none';

        // Check if I am the author of this post
        const isMyPost = post.authorIdentifier === currentUserIdentifier;

        card.innerHTML = `
            <div class="post-header" style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div class="user-avatar" style="width: 40px; height: 40px; background: #c881d2; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                        ${post.authorIdentifier ? post.authorIdentifier.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                        <div style="font-weight: 600;">${post.authorIdentifier}</div>
                        <div style="font-size: 0.8rem; color: #666;">${new Date(post.createdAt).toLocaleDateString()}</div>
                    </div>
                </div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <div style="background: ${badgeColor}; color: ${badgeTextColor}; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; height: fit-content;">
                        ${badgeText}
                    </div>
                    ${isMyPost ? `<i data-lucide="trash-2" class="delete-post-btn" style="color: #ff4d4d; cursor: pointer; width: 18px;"></i>` : ''}
                </div>
            </div>
            <div class="post-content" style="margin-bottom: 15px; line-height: 1.5;">
                ${post.content}
            </div>
            <div class="post-footer" style="display: flex; gap: 20px; color: #666; font-size: 0.9rem; border-top: 1px solid #eee; padding-top: 10px;">
                <div class="like-btn" style="cursor: pointer; display: flex; align-items: center; gap: 5px;">
                    <i data-lucide="heart" fill="${heartFill}"></i> <span class="like-count">${likeCount}</span>
                </div>
                <div class="toggle-comments-btn" style="cursor: pointer; display: flex; align-items: center; gap: 5px;">
                    <i data-lucide="message-square"></i> <span class="comment-count">${commentCount}</span>
                </div>
            </div>

            <div class="comment-section" style="display: none;">
                <div class="comments-list" style="margin-top: 15px;">
                    ${post.comments ? post.comments.map(c => `
                        <div class="comment-item" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding-bottom: 5px; border-bottom: 1px solid #f0f0f0;">
                            <span><strong>${c.userIdentifier}</strong>: ${c.text}</span>
                            ${c.userIdentifier === currentUserIdentifier ? `<i data-lucide="x" class="delete-comment-btn" data-comment-id="${c._id}" style="color: #ff4d4d; cursor: pointer; width: 14px;"></i>` : ''}
                        </div>
                    `).join('') : ''}
                </div>
                <div class="comment-input-group">
                    <input type="text" class="comment-input" placeholder="Write a comment...">
                    <button class="submit-comment-btn">Reply</button>
                </div>
            </div>
        `;
        postContainer.appendChild(card);
    });

    lucide.createIcons();
}

// INTERACTION LOGIC (Click delegation)
document.addEventListener('click', async (e) => {
    
    // 1. LIKE TOGGLE
    const likeBtn = e.target.closest('.like-btn');
    if (likeBtn) {
        const postCard = likeBtn.closest('.post-card');
        const postId = postCard.getAttribute('data-id');

>>>>>>> ebb70e2 (d)
        try {
            const response = await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
            });
<<<<<<< HEAD
            if (response.ok) {
                const data = await response.json();
                likeBtn.querySelector('.like-count').innerText = data.likesCount;
                const heartIcon = likeBtn.querySelector('svg');
                if (heartIcon) {
                    heartIcon.style.fill = data.isLiked ? '#a820c7' : 'none';
                    heartIcon.style.color = data.isLiked ? '#a820c7' : 'currentColor';
=======
            
            if (response.ok) {
                const data = await response.json();
                likeBtn.querySelector('.like-count').innerText = data.likesCount;
                const icon = likeBtn.querySelector('svg') || likeBtn.querySelector('i');
                if (icon) {
                    icon.setAttribute('fill', data.isLiked ? '#8b5cf6' : 'none');
                    icon.style.color = data.isLiked ? '#8b5cf6' : 'currentColor';
>>>>>>> ebb70e2 (d)
                }
            }
        } catch (err) { console.error('Like error:', err); }
    }

<<<<<<< HEAD
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
=======
    // 2. COMMENT VISIBILITY
    const toggleBtn = e.target.closest('.toggle-comments-btn');
    if (toggleBtn) {
        const postCard = toggleBtn.closest('.post-card');
        const commentSection = postCard.querySelector('.comment-section');
        commentSection.style.display = commentSection.style.display === 'none' ? 'block' : 'none';
    }

    // 3. SUBMIT COMMENT
    const submitCommentBtn = e.target.closest('.submit-comment-btn');
    if (submitCommentBtn) {
        const postCard = submitCommentBtn.closest('.post-card');
        const postId = postCard.getAttribute('data-id');
        const inputField = postCard.querySelector('.comment-input');
        const text = inputField.value.trim();

>>>>>>> ebb70e2 (d)
        if (!text) return;

        try {
            const response = await fetch(`http://localhost:5000/api/posts/${postId}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ text })
            });

            if (response.ok) {
<<<<<<< HEAD
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
=======
                fetchPosts(); // Refresh for clean UI and to get the new comment ID for deletion
>>>>>>> ebb70e2 (d)
            }
        } catch (err) { console.error('Comment error:', err); }
    }

<<<<<<< HEAD
    // REPORT POST — opens modal
    const reportBtn = e.target.closest('.report-btn');
    if (reportBtn) {
        const postId = reportBtn.getAttribute('data-id');
        openReportModal(postId, reportBtn);
=======
    // 4. DELETE POST
    const deletePostBtn = e.target.closest('.delete-post-btn');
    if (deletePostBtn && confirm('Are you sure you want to delete this post?')) {
        const postCard = deletePostBtn.closest('.post-card');
        const postId = postCard.getAttribute('data-id');

        try {
            const response = await fetch(`http://localhost:5000/api/posts/${postId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) postCard.remove();
            else alert('Could not delete post.');
        } catch (err) { console.error('Delete post error:', err); }
    }

    // 5. DELETE COMMENT
    const deleteCommentBtn = e.target.closest('.delete-comment-btn');
    if (deleteCommentBtn && confirm('Remove this comment?')) {
        const postCard = deleteCommentBtn.closest('.post-card');
        const postId = postCard.getAttribute('data-id');
        const commentId = deleteCommentBtn.getAttribute('data-comment-id');

        try {
            const response = await fetch(`http://localhost:5000/api/posts/${postId}/comments/${commentId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) fetchPosts();
        } catch (err) { console.error('Delete comment error:', err); }
>>>>>>> ebb70e2 (d)
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
<<<<<<< HEAD
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Show the bouncer our ID
            },
            body: JSON.stringify({
                postType: postType,
                content: text
            })
=======
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ postType, content: text })
>>>>>>> ebb70e2 (d)
        });

        if (response.ok) {
            closeComposer();
<<<<<<< HEAD
            fetchPosts();
        } else {
            alert('Failed to post. Please try again.');
        }
    } catch (error) {
        console.error('Error submitting post:', error);
    } finally {
=======
            fetchPosts(); 
        }
    } catch (error) { console.error('Submit post error:', error); }
    finally {
>>>>>>> ebb70e2 (d)
        postBtn.textContent = 'Post';
        postBtn.disabled = false;
    }
});

<<<<<<< HEAD
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
=======
// USER DROPDOWN & LOGOUT
document.addEventListener('click', (e) => {
    const avatar = document.getElementById('user-avatar-main');
    const dropdown = document.getElementById('user-dropdown');
    
    if (avatar && avatar.contains(e.target)) {
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    } else if (dropdown && !dropdown.contains(e.target)) {
        dropdown.style.display = 'none';
    }
});

document.getElementById('logout-btn')?.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '../landing-page/login.html';
});

// LOAD ON START
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    fetchPosts();
>>>>>>> ebb70e2 (d)
});