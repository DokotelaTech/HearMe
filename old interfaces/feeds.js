let posts = [];
let currentFilter = "all";   // 'all', 'social', 'success'

//  Load posts from localStorage
function loadPosts() {
    const stored = localStorage.getItem("hearMe_posts");
    if (stored) {
        posts = JSON.parse(stored);
        // Ensure each post has the required fields
        posts = posts.map(p => ({
            ...p,
            comments: Array.isArray(p.comments) ? p.comments : [],
            liked: p.liked === true,
            id: p.id || crypto.randomUUID?.() || Date.now() + "-" + Math.random()
        }));
    } else {
        posts = [];   // completely empty – no demo posts
        savePosts();
    }
    renderFeed();
}

function savePosts() {
    // localStorage.removeItem("hearMe_posts");
    localStorage.setItem("hearMe_posts", JSON.stringify(posts));
}

//  Helper functions
function getTagClass(tag) {
    if (tag === "Social Anxiety") return "tag-social-anxiety";
    if (tag === "Self Discovery") return "tag-self-discovery";
    if (tag === "Success") return "tag-success";
    return "tag-community";
}

function getFilteredPosts() {
    if (currentFilter === "all") return [...posts];
    if (currentFilter === "social") {
        return posts.filter(p => p.tag === "Social Anxiety" || p.tag === "Self Discovery");
    }
    if (currentFilter === "success") {
        return posts.filter(p => p.tag === "Success");
    }
    return [...posts];
}

function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// 3. Render the feed using the exact HTML structure from your design
function renderFeed() {
    const container = document.getElementById("feedGrid");
    if (!container) return;

    const filtered = getFilteredPosts();

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h2>✨ welcome to HearMe</h2>
                <p>Your anonymous voice matters.<br>Real stories, real support.</p>
                <div class="demo-hint">↓ tap the + button to create your first post</div>
            </div>
        `;
        return;
    }

    let html = "";
    for (const post of filtered) {
        const tagClass = getTagClass(post.tag);
        const likedClass = post.liked ? "liked" : "";
        const commentsListHtml = post.comments.map(c => `
            <div class="single-comment">💬 ${escapeHtml(c)}</div>
        `).join("");

        html += `
            <div class="card" data-post-id="${post.id}">
                <div class="card-header">
                    <div class="user-info">
                        <div class="avatar">👻</div>
                        <div class="user-meta">
                            <div class="user">${escapeHtml(post.user)}</div>
                            <div class="time">${escapeHtml(post.time)}</div>
                        </div>
                    </div>
                    <span class="tag ${tagClass}">${escapeHtml(post.tag)}</span>
                </div>
                <div class="post-text">${escapeHtml(post.text)}</div>
                <div class="reactions">
                    <div class="reaction-bar">
                        <button class="like-btn ${likedClass}" data-id="${post.id}">
                            ${post.likes} Energy Up
                        </button>
                        <span class="comment-count">${post.comments.length}</span>
                    </div>
                    <div class="comment-input-area">
                        <input type="text" placeholder="Write a comment..." id="comment-input-${post.id}">
                        <button class="comment-submit" data-id="${post.id}">Post</button>
                    </div>
                    <div class="comments-list">${commentsListHtml}</div>
                </div>
            </div>
        `;
    }
    container.innerHTML = html;

    // Attach event listeners for like and comment buttons
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.removeEventListener('click', likeHandler);
        btn.addEventListener('click', likeHandler);
    });
    document.querySelectorAll('.comment-submit').forEach(btn => {
        btn.removeEventListener('click', commentHandler);
        btn.addEventListener('click', commentHandler);
    });
}

// Like handler (prevents double-liking)
function likeHandler(e) {
    const btn = e.currentTarget;
    const postId = btn.getAttribute('data-id');
    const post = posts.find(p => p.id === postId);
    if (!post || post.liked) return;
    post.likes += 1;
    post.liked = true;
    savePosts();
    renderFeed();
}

//  Comment handler
function commentHandler(e) {
    const btn = e.currentTarget;
    const postId = btn.getAttribute('data-id');
    const input = document.getElementById(`comment-input-${postId}`);
    const commentText = input.value.trim();
    if (!commentText) return;

    const post = posts.find(p => p.id === postId);
    if (post) {
        post.comments.push(commentText);
        input.value = "";
        savePosts();
        renderFeed();
        // Optional: auto-scroll to bottom of comments
        const container = document.querySelector('.feed-container');
        if (container) container.scrollTop = container.scrollHeight;
    }
}

//  Tab filtering
function initTabs() {
    const tabs = document.querySelectorAll(".tab");
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const filter = tab.getAttribute("data-filter");
            if (filter === "all") currentFilter = "all";
            else if (filter === "social") currentFilter = "social";
            else if (filter === "success") currentFilter = "success";
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            renderFeed();
        });
    });
}


// FAB button – redirect to createPost.html
function initFab() {
    const fab = document.getElementById("createPostFab");
    if (fab) {
        fab.addEventListener("click", () => {
            window.location.href = "createPost.html";
        });
    }
}

// Notification bell (demo)
function initNotification() {
    const bell = document.getElementById("notificationBell");
    if (bell) {
        bell.addEventListener("click", () => {
            alert("🔔 You'll get notified when someone interacts with your posts.");
        });
    }
}

// Start everything
document.addEventListener("DOMContentLoaded", () => {
    loadPosts();
    initTabs();
    initFab();
    initNotification();
    
});
