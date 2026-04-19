const postFeed = document.getElementById('postFeed');

// Initial Mock Data if localStorage is empty
const defaultPosts = [
    {
        user: "Neon-Shadow-42",
        time: "2h ago",
        text: "Sometimes I feel like I'm the only one who gets anxious about checking my phone in public. Anyone else?",
        tag: "Social Anxiety",
        likes: 127,
        comments: 23
    },
    {
        user: "Cyber-Whisper-88",
        time: "4h ago",
        text: "Just realized I've been living someone else's dream instead of my own. Time to recalibrate. 🌟",
        tag: "Self Discovery",
        likes: 342,
        comments: 56
    }
];

function loadPosts() {
    const posts = JSON.parse(localStorage.getItem("posts")) || defaultPosts;
    renderPosts(posts);
}

function renderPosts(posts) {
    postFeed.innerHTML = "";
    posts.forEach((post, index) => {
        const tagClass = post.tag === "Social Anxiety" ? "tag-social" : "tag-self";
        
        const card = `
            <div class="card">
                <div class="card-header">
                    <div class="avatar">👻</div>
                    <div class="user-info">
                        <div class="user-name">${post.user}</div>
                        <div class="post-time">${post.time}</div>
                    </div>
                    <span class="tag ${tagClass}">${post.tag}</span>
                </div>
                <div class="post-text">${post.text}</div>
                <div class="card-footer">
                    <div class="stat" onclick="handleLike(${index})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                        <span>${post.likes}</span>
                    </div>
                    <div class="stat">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                        <span>${post.comments.length || post.comments} comments</span>
                    </div>
                </div>
            </div>
        `;
        postFeed.innerHTML += card;
    });
}

function filterPosts(type) {
    // Basic filter UI logic
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.currentTarget.classList.add('active');
    // Actual filtering logic could be added here
}

window.onload = loadPosts;