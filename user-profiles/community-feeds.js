// UI LOGIC (Expand / Collapse composer) - Kept exactly as you wrote it!
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

// Get the user's token and ID from local storage
const token = localStorage.getItem('token');
const currentUserIdentifier = localStorage.getItem('userIdentifier');

// //  If they aren't logged in, kick them back to login
// if (!token) {
//     alert("session expired, please log in to access this page")
//     window.location.href = '/login';
// }

// Set the avatar letter at the top right to match their username
document.querySelector('.user-avatar').textContent = currentUserIdentifier ? currentUserIdentifier.charAt(0).toUpperCase() : 'U';

// Function to fetch all posts from the database when page loads
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
    postContainer.innerHTML = ''; // Clear loading state
    
    if (posts.length === 0) {
        postContainer.innerHTML = '<p class="empty-state">No posts yet. Be the first to share!</p>';
        return;
    }

    posts.forEach(post => {
        // Create the card container
        const card = document.createElement('div');
        // Ensure this matches the CSS class for the wrapper
        card.className = 'post-card'; 
        
        // Setup styling based on Struggle vs Success
        const isSuccess = post.postType === 'success';
        const badgeClass = isSuccess ? 'badge-success' : 'badge-struggle';
        
        // Only show the sparkles icon if it's a success post
        const badgeIcon = isSuccess ? '<i data-lucide="sparkles" style="width: 14px; height: 14px;"></i> ' : '';
        const badgeText = isSuccess ? 'Success' : 'Struggle';
        
        // Calculate interactions
        const likeCount = post.likes ? post.likes.length : 0;
        const commentCount = post.comments ? post.comments.length : 0;
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
                <button class="post-action-btn" onclick="alert('Like route coming next!')">
                    <i data-lucide="heart"></i> ${likeCount}
                </button>
                <button class="post-action-btn">
                    <i data-lucide="message-square"></i> ${commentCount}
                </button>
                <button class="post-action-btn">
                    <i data-lucide="share-2"></i> Share
                </button>
            </div>
        `;
        
        postContainer.appendChild(card);
    });

    // Re-initialize Lucide icons for the newly injected HTML
    lucide.createIcons();
}

// Function to handle clicking the POST button
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
                'Authorization': `Bearer ${token}` // Show the bouncer our ID
            },
            body: JSON.stringify({
                postType: postType,
                content: text
            })
        });

        if (response.ok) {
            closeComposer();
            fetchPosts(); // Refresh the feed immediately to show the new post
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

// Load everything when the page opens!
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    fetchPosts();
});