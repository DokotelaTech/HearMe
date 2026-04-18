/* ── feeds.js ───────────────────────────────────────────────────────────────
   Handles rendering, liking, and commenting on posts stored in localStorage.
   ─────────────────────────────────────────────────────────────────────────── */

const feed  = document.querySelector(".feed");
let   posts = JSON.parse(localStorage.getItem("posts")) || [];

// ── Boot ─────────────────────────────────────────────────────────────────────
showPosts();

// ── Render all posts ──────────────────────────────────────────────────────────
function showPosts() {
    feed.innerHTML = "";

    if (posts.length === 0) {
        feed.innerHTML = `
            <div class="no-posts">
                <h2>No posts yet</h2>
                <p>Be the first to share something anonymously.</p>
            </div>`;
        return;
    }

    posts.forEach((post, index) => {
        normalisePost(post);
        feed.innerHTML += buildCard(post, index);
    });

    savePosts();
}

// ── Ensure every post has the required fields ─────────────────────────────────
function normalisePost(post) {
    if (!Array.isArray(post.comments)) post.comments = [];
    if (!post.likes)   post.likes = 0;
    if (!post.user)    post.user  = "Anonymous User";
    if (!post.time)    post.time  = "Just now";
    if (!post.tag)     post.tag   = "General";
}

// ── Build the card HTML ───────────────────────────────────────────────────────
function buildCard(post, index) {
    return `
    <div class="card">

        <div class="card-header">
            <div class="user-info">
                <div class="avatar">👻</div>
                <div class="user-meta">
                    <div class="user">${post.user}</div>
                    <div class="time">${post.time}</div>
                </div>
            </div>
            <span class="tag ${getTagClass(post.tag)}">${post.tag}</span>
        </div>

        <div class="text">${post.text}</div>

        <div class="post-reactions">
            <div class="reaction-row">
                <button class="like-btn ${post.liked ? 'liked' : ''}"
                        onclick="likePost(${index})">
                    ${post.likes} Energy Up
                </button>
                <span class="comment-count">${post.comments.length} comments</span>
            </div>

            <div class="comment-section">
                <input  type="text"
                        id="comment${index}"
                        placeholder="Write a comment…">
                <button class="comment-btn"
                        onclick="addComment(${index})">Post</button>
            </div>

            <div class="comments-list">
                ${buildComments(post.comments)}
            </div>
        </div>

    </div>`;
}

// ── Map tag label → CSS modifier class ───────────────────────────────────────
function getTagClass(tag) {
    const map = {
        "Social Anxiety":  "tag-social-anxiety",
        "Self Discovery":  "tag-self-discovery",
        "Community":       "tag-community",
    };
    return map[tag] || "tag-community";
}

// ── Build comment list HTML ───────────────────────────────────────────────────
function buildComments(comments) {
    return comments
        .map(c => `<p class="single-comment">• ${c}</p>`)
        .join("");
}

// ── Like a post (one like per session via the .liked flag) ────────────────────
function likePost(index) {
    if (posts[index].liked) return;     // prevent double-liking
    posts[index].likes++;
    posts[index].liked = true;
    savePosts();
}

// ── Add a comment ─────────────────────────────────────────────────────────────
function addComment(index) {
    const input   = document.getElementById("comment" + index);
    const comment = input.value.trim();

    if (!comment) {
        input.focus();
        return;
    }

    posts[index].comments.push(comment);
    input.value = "";
    savePosts();
}

// ── Persist & re-render ───────────────────────────────────────────────────────
function savePosts() {
    localStorage.setItem("posts", JSON.stringify(posts));
    showPosts();
}