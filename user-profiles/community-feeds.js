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

// Function to turn MongoDB data into HTML cards
function renderPosts(posts) {
    postContainer.innerHTML = ''; 
    
    if (posts.length === 0) {
        postContainer.innerHTML = '<p style="text-align:center; color:#666;">No posts yet. Be the first to share!</p>';
        return;
    }

    posts.forEach(post => {
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

        try {
            const response = await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                likeBtn.querySelector('.like-count').innerText = data.likesCount;
                const icon = likeBtn.querySelector('svg') || likeBtn.querySelector('i');
                if (icon) {
                    icon.setAttribute('fill', data.isLiked ? '#8b5cf6' : 'none');
                    icon.style.color = data.isLiked ? '#8b5cf6' : 'currentColor';
                }
            }
        } catch (err) { console.error('Like error:', err); }
    }

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

        if (!text) return;

        try {
            const response = await fetch(`http://localhost:5000/api/posts/${postId}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ text })
            });

            if (response.ok) {
                fetchPosts(); // Refresh for clean UI and to get the new comment ID for deletion
            }
        } catch (err) { console.error('Comment error:', err); }
    }

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
        }
    } catch (error) { console.error('Submit post error:', error); }
    finally {
        postBtn.textContent = 'Post';
        postBtn.disabled = false;
    }
});

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
});