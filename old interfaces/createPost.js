// createPost.js – handles submission and redirect
document.addEventListener("DOMContentLoaded", () => {
    const submitBtn = document.getElementById("submitPostBtn");
    const cancelBtn = document.getElementById("cancelBtn");
    const postText = document.getElementById("postText");
    const postTag = document.getElementById("postTag");

    function getRandomUsername() {
        const prefixes = ["Echo", "Quiet", "Lunar", "Aether", "Willow", "Neon", "Cyber", "Phantom", "Misty", "Silent"];
        const suffixes = ["Soul", "Fox", "Drift", "Shade", "Shadow", "Whisper", "Pulse", "Rain", "Void", "Spark"];
        const randomPre = prefixes[Math.floor(Math.random() * prefixes.length)];
        const randomSuf = suffixes[Math.floor(Math.random() * suffixes.length)];
        const num = Math.floor(Math.random() * 900) + 10;
        return `${randomPre}-${randomSuf}-${num}`;
    }

    function createPost() {
        const text = postText.value.trim();
        if (!text) {
            alert("Please write something before posting.");
            return;
        }
        const tag = postTag.value;
        const newPost = {
            id: crypto.randomUUID ? crypto.randomUUID() : Date.now() + "-" + Math.random(),
            user: getRandomUsername(),
            time: "Just now",
            text: text,
            tag: tag,
            likes: 0,
            liked: false,
            comments: []
        };

        // Get existing posts or empty array
        let posts = JSON.parse(localStorage.getItem("hearMe_posts")) || [];
        posts.unshift(newPost);
        localStorage.setItem("hearMe_posts", JSON.stringify(posts));

        // Redirect to feed page
        window.location.href = "feeds.html";
    }

    submitBtn.addEventListener("click", createPost);
    cancelBtn.addEventListener("click", () => {
        window.location.href = "feeds.html";
    });
});