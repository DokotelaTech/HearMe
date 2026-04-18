let form = document.querySelector("form");
let textarea = document.querySelector("textarea");

form.addEventListener("submit", function(e) {
    e.preventDefault();

    let text = textarea.value.trim();

    if (text === "") {
        alert("Post cannot be empty.");
        return;
    }

    if (text.length < 5) {
        alert("Post too short.");
        return;
    }

    let posts = JSON.parse(localStorage.getItem("posts")) || [];

    let newPost = {
        user: "Anonymous User",
        time: new Date().toLocaleString(),
        text: text,
        likes: 0,
        comments: []
    };

    posts.push(newPost);

    localStorage.setItem("posts", JSON.stringify(posts));

    alert("Post created!");

    window.location.href = "feeds.html";
});


//adding user anonymous name and fixing bug for cancel button and post button when clicked
let cancelBtn = document.querySelector(".cancel");

// POST
form.addEventListener("submit", function (e) {
    e.preventDefault();

    let text = textarea.value.trim();

    if (text === "") {
        alert("Write something first.");
        return;
    }

    let posts = JSON.parse(localStorage.getItem("posts")) || [];

    let newPost = {
        user: generateName(),
        time: "Just now",
        text: text,
        likes: Math.floor(Math.random() * 200) + 10,
        comments: Math.floor(Math.random() * 50) + 1,
        tag: randomTag()
    };

    posts.unshift(newPost);

    localStorage.setItem("posts", JSON.stringify(posts));

    window.location.href = "feeds.html";
});

// CANCEL
cancelBtn.addEventListener("click", function () {
    window.location.href = "feeds.html";
});

// RANDOM USERNAME
function generateName() {
    let names = [
        "Neon-Shadow-42",
        "Cyber-Whisper-88",
        "Ghost-Mind-21",
        "Silent-Star-11",
        "Dream-Walker-55",
        "Pixel-Soul-99"
    ];

    return names[Math.floor(Math.random() * names.length)];
}

// RANDOM TAG
function randomTag() {
    let tags = [
        "Social Anxiety",
        "Self Discovery",
        "Mental Health",
        "Relationships",
        "Success",
        "Growth"
    ];

    return tags[Math.floor(Math.random() * tags.length)];
}