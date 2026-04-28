lucide.createIcons();

// Initial data
// let posts = [
//     {
//         id: 1,
//         user: "User#8472",
//         time: "2 hours ago",
//         tag: "Success",
//         tagClass: "success",
//         content: "After 3 months of therapy and using this app, I finally feel like I can breathe again. To anyone struggling with anxiety - it does get better. Keep going! 💜",
//         likes: 234,
//         comments: 45
//     }
// ];

const postContainer = document.getElementById('post-container');
const postInput = document.getElementById('post-input');
const clearBtn = document.getElementById('clear-btn');

// function renderPosts() {
//     // THIS CLEARS THE PAGE CONTENT BEFORE REDRAWING
//     postContainer.innerHTML = ''; 

//     if (posts.length === 0) {
//         postContainer.innerHTML = '<div class="empty-state">The feed is currently empty. Share a thought to start!</div>';
//         return;
//     }
    
//     posts.forEach(post => {
//         const postHTML = `
//             <article class="post-card">
//                 <div class="post-header">
//                     <div class="user-info">
//                         <div class="u-img">U</div>
//                         <div>
//                             <span class="u-name">${post.user}</span>
//                             <span class="u-time">${post.time}</span>
//                         </div>
//                     </div>
//                     <span class="tag ${post.tagClass}">${post.tag}</span>
//                 </div>
//                 <p class="post-content">${post.content}</p>
//                 <div class="post-actions">
//                     <div class="action"><i data-lucide="heart"></i> ${post.likes}</div>
//                     <div class="action"><i data-lucide="message-circle"></i> ${post.comments}</div>
//                     <div class="action"><i data-lucide="share-2"></i> Share</div>
//                 </div>
//             </article>
//         `;
//         postContainer.insertAdjacentHTML('beforeend', postHTML);
//     });
    
//     lucide.createIcons();
// }

// Add new post
postInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && postInput.value.trim() !== "") {
        const newPost = {
            id: Date.now(),
            user: "Anonymous User",
            time: "Just now",
            tag: "New",
            tagClass: "struggle",
            content: postInput.value,
            likes: 0,
            comments: 0
        };
        posts.unshift(newPost);
        postInput.value = '';
        renderPosts();
    }
});

// // Clear all posts functionality
// clearBtn.addEventListener('click', () => {
//     posts = []; // Empty the data array
//     renderPosts(); // Refresh the UI (which will now show the empty state)
// });

const postButton = document.getElementById('post-button');

// 1. Functional logic to create a post
function addNewPost() {
    const content = postInput.value.trim();
    
    if (content !== "") {
        const newPost = {
            id: Date.now(),
            user: "Anonymous User",
            time: "Just now",
            tag: "New",
            tagClass: "struggle",
            content: content,
            likes: 0,
            comments: 0
        };

        posts.unshift(newPost); // Add to data array
        postInput.value = '';   // Clear input field
        renderPosts();          // RE-RENDER UI (clears current list and redraws)
    }
}

// 2. Trigger on Button Click
postButton.addEventListener('click', addNewPost);

// 3. Trigger on Enter Key
postInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addNewPost();
    }
});
renderPosts();