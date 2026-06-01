const collapsed = document.getElementById('post-collapsed');
const expanded = document.getElementById('post-expanded');
const simpleInput = document.getElementById('post-input-simple');
const openBtn = document.getElementById('open-composer');
const cancelBtn = document.getElementById('cancel-post');
const postBtn = document.getElementById('post-button');
const textarea = document.getElementById('post-textarea');
const tabBtns = document.querySelectorAll('.tab-btn');
const postContainer = document.getElementById('post-container');
const gifPanel = document.getElementById('gif-panel');
const gifResults = document.getElementById('gif-results');
const selectedGifBox = document.getElementById('selected-gif');
const token = localStorage.getItem('token');
const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

let postType = 'struggle';
let giphyApiKey = '';
let selectedGifUrl = '';

if (!token) {
    alert('Session expired, please log in.');
    window.location.href = '/login';
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function setAvatarImage(element, imageUrl, fallback) {
    if (!element) return;

    if (imageUrl) {
        element.textContent = '';
        element.style.backgroundImage = `url(${imageUrl})`;
        element.style.backgroundSize = 'cover';
        element.style.backgroundPosition = 'center';
    } else {
        element.textContent = fallback;
        element.style.backgroundImage = '';
    }
}

function getCurrentUserId() {
    return String(currentUser.id || currentUser._id || currentUser.userId || '');
}

function renderAvatar(className, imageUrl, fallback) {
    const safeFallback = escapeHtml(fallback || 'U');
    const safeUrl = escapeHtml(imageUrl || '');

    if (safeUrl) {
        return `<div class="${className}" style="background-image:url('${safeUrl}')"></div>`;
    }

    return `<div class="${className}">${safeFallback}</div>`;
}

async function hydrateUserChrome() {
    try {
        const response = await fetch('/api/user/profile', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        const name = data.identifier || 'Anonymous';
        setAvatarImage(document.querySelector('.user-avatar'), data.profileImage, name.charAt(0).toUpperCase());
    } catch (error) {
        setAvatarImage(document.querySelector('.user-avatar'), '', 'U');
    }
}

function openComposer() {
    collapsed.style.display = 'none';
    expanded.style.display = 'block';
    textarea.focus();
}

function closeComposer() {
    expanded.style.display = 'none';
    collapsed.style.display = 'flex';
    textarea.value = '';
    selectedGifUrl = '';
    gifPanel.style.display = 'none';
    gifResults.innerHTML = '';
    selectedGifBox.innerHTML = '';
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
            : 'Share your win, big or small. Inspire others!';
    });
});

async function loadGiphyKey() {
    const response = await fetch('/api/config/giphy', {
        headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    giphyApiKey = data.apiKey || '';
}

async function searchGifs() {
    const query = document.getElementById('gif-search-input').value.trim();
    if (!query || !giphyApiKey) return;

    gifResults.innerHTML = '<p class="gif-state">Searching...</p>';

    const url = `https://api.giphy.com/v1/gifs/search?api_key=${encodeURIComponent(giphyApiKey)}&q=${encodeURIComponent(query)}&limit=12&rating=pg-13`;
    const response = await fetch(url);
    const data = await response.json();
    const gifs = data.data || [];

    if (!gifs.length) {
        gifResults.innerHTML = '<p class="gif-state">No GIFs found.</p>';
        return;
    }

    gifResults.innerHTML = gifs.map(gif => {
        const gifUrl = gif.images?.fixed_height?.url || gif.images?.original?.url;
        return `<button class="gif-choice" data-gif="${escapeHtml(gifUrl)}" type="button">
            <img src="${escapeHtml(gifUrl)}" alt="${escapeHtml(gif.title || 'GIF')}">
        </button>`;
    }).join('');
}

document.getElementById('open-gif-search').addEventListener('click', () => {
    gifPanel.style.display = gifPanel.style.display === 'none' ? 'block' : 'none';
});

document.getElementById('gif-search-btn').addEventListener('click', () => {
    searchGifs().catch(error => {
        gifResults.innerHTML = `<p class="gif-state error">${escapeHtml(error.message)}</p>`;
    });
});

document.getElementById('gif-search-input').addEventListener('keydown', event => {
    if (event.key === 'Enter') {
        event.preventDefault();
        searchGifs().catch(error => {
            gifResults.innerHTML = `<p class="gif-state error">${escapeHtml(error.message)}</p>`;
        });
    }
});

document.getElementById('gif-clear-btn').addEventListener('click', () => {
    selectedGifUrl = '';
    selectedGifBox.innerHTML = '';
});

gifResults.addEventListener('click', event => {
    const button = event.target.closest('[data-gif]');
    if (!button) return;

    selectedGifUrl = button.dataset.gif;
    selectedGifBox.innerHTML = `
        <div class="selected-gif-card">
            <span>Selected GIF</span>
            <img src="${escapeHtml(selectedGifUrl)}" alt="Selected GIF">
        </div>`;
});

async function fetchPosts() {
    try {
        const response = await fetch('/api/posts', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch posts');
        renderPosts(await response.json());
    } catch (error) {
        postContainer.innerHTML = `<p class="empty-state">${escapeHtml(error.message)}</p>`;
    }
}

function renderComments(post) {
    const comments = post.comments || [];

    if (!comments.length) {
        return '<p class="comment-empty">No comments yet.</p>';
    }

    return comments.map(comment => {
        const ownComment = String(comment.userId || '') === getCurrentUserId();
        const initial = comment.userIdentifier ? comment.userIdentifier.charAt(0).toUpperCase() : 'U';
        return `
            <div class="comment-bubble ${ownComment ? 'own-comment' : ''}">
                ${renderAvatar('comment-avatar', comment.userProfileImage, initial)}
                <div class="comment-body">
                    <div class="comment-topline">
                        <div class="comment-owner">${escapeHtml(comment.userIdentifier)}</div>
                        ${ownComment ? `
                            <button class="comment-delete-btn" data-post-id="${post._id}" data-comment-id="${comment._id}" type="button" title="Delete comment">
                                <i data-lucide="trash-2"></i>
                            </button>` : ''}
                    </div>
                    <p>${escapeHtml(comment.text)}</p>
                </div>
            </div>`;
    }).join('');
}

function renderPosts(posts) {
    if (!posts.length) {
        postContainer.innerHTML = '<p class="empty-state">No posts yet. Be the first to share!</p>';
        return;
    }

    postContainer.innerHTML = posts.map(post => {
        const isSuccess = post.postType === 'success';
        const likeCount = post.likes ? post.likes.length : 0;
        const commentCount = post.comments ? post.comments.length : 0;
        const initial = post.authorIdentifier ? post.authorIdentifier.charAt(0).toUpperCase() : 'U';
        const ownPost = String(post.authorId || '') === getCurrentUserId();

        return `
            <article class="post-card">
                <div class="post-header">
                    <div class="post-user-info">
                        ${renderAvatar('post-avatar', post.authorProfileImage, initial)}
                        <div class="post-meta">
                            <span class="post-username">${escapeHtml(post.authorIdentifier)}</span>
                            <span class="post-time">${new Date(post.createdAt).toLocaleString()}</span>
                        </div>
                    </div>
                    <div class="post-header-actions">
                        <div class="post-badge ${isSuccess ? 'badge-success' : 'badge-struggle'}">
                            ${isSuccess ? '<i data-lucide="sparkles"></i>' : ''}${isSuccess ? 'Success' : 'Struggle'}
                        </div>
                        ${ownPost ? `
                            <button class="post-delete-btn" data-id="${post._id}" type="button" title="Delete post">
                                <i data-lucide="trash-2"></i>
                            </button>` : ''}
                    </div>
                </div>

                ${post.content ? `<div class="post-content">${escapeHtml(post.content)}</div>` : ''}
                ${post.gifUrl ? `<img class="post-gif" src="${escapeHtml(post.gifUrl)}" alt="Post GIF">` : ''}

                <div class="post-footer">
                    <button class="post-action-btn like-btn" data-id="${post._id}">
                        <i data-lucide="heart"></i> <span class="like-count">${likeCount}</span>
                    </button>
                    <button class="post-action-btn comment-toggle" data-id="${post._id}" aria-expanded="false">
                        <i data-lucide="message-square"></i> ${commentCount}
                    </button>
                    <button class="post-action-btn report-btn" data-id="${post._id}">
                        <i data-lucide="flag"></i> Report
                    </button>
                </div>

                <section class="comments-section is-closed" id="comments-${post._id}">
                    <div class="comment-list">${renderComments(post)}</div>
                    <div class="comment-input-row">
                        <input type="text" class="comment-input" placeholder="Comment anonymously..." data-comment-input="${post._id}">
                        <button class="comment-submit" data-comment-submit="${post._id}">Comment</button>
                    </div>
                </section>
            </article>`;
    }).join('');

    lucide.createIcons();
}

document.addEventListener('click', async event => {
    const likeBtn = event.target.closest('.like-btn');
    const commentToggle = event.target.closest('.comment-toggle');
    const commentSubmit = event.target.closest('[data-comment-submit]');
    const deletePostBtn = event.target.closest('.post-delete-btn');
    const deleteCommentBtn = event.target.closest('.comment-delete-btn');
    const reportBtn = event.target.closest('.report-btn');

    if (likeBtn) {
        const postId = likeBtn.dataset.id;
        const res = await fetch(`/api/posts/${postId}/like`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
            likeBtn.querySelector('.like-count').textContent = data.likesCount;
            likeBtn.style.color = data.isLiked ? '#a855f7' : '';
        }
    }

    if (commentToggle) {
        const postId = commentToggle.dataset.id;
        const section = document.getElementById(`comments-${postId}`);
        if (section) {
            const isClosed = section.classList.toggle('is-closed');
            commentToggle.setAttribute('aria-expanded', String(!isClosed));
        }
    }

    if (commentSubmit) {
        const postId = commentSubmit.dataset.commentSubmit;
        const input = document.querySelector(`[data-comment-input="${postId}"]`);
        const text = input.value.trim();
        if (!text) return;

        const res = await fetch(`/api/posts/${postId}/comment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ text })
        });

        if (res.ok) {
            input.value = '';
            await fetchPosts();
        }
    }

    if (deletePostBtn) {
        const postId = deletePostBtn.dataset.id;
        if (!confirm('Delete this post?')) return;

        const res = await fetch(`/api/posts/${postId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            alert(data.message || 'Could not delete post.');
            return;
        }

        await fetchPosts();
    }

    if (deleteCommentBtn) {
        const { postId, commentId } = deleteCommentBtn.dataset;
        if (!confirm('Delete this comment?')) return;

        const res = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            alert(data.message || 'Could not delete comment.');
            return;
        }

        await fetchPosts();
    }

    if (reportBtn) {
        openReportModal(reportBtn.dataset.id, reportBtn);
    }
});

postBtn.addEventListener('click', async () => {
    const text = textarea.value.trim();
    if (!text && !selectedGifUrl) return;

    postBtn.textContent = 'Posting...';
    postBtn.disabled = true;

    try {
        const response = await fetch('/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ postType, content: text, gifUrl: selectedGifUrl })
        });

        if (!response.ok) throw new Error('Failed to post. Please try again.');
        closeComposer();
        fetchPosts();
    } catch (error) {
        alert(error.message);
    } finally {
        postBtn.textContent = 'Post';
        postBtn.disabled = false;
    }
});

let reportTargetPostId = null;
let reportTargetBtn = null;

function openReportModal(postId, btn) {
    reportTargetPostId = postId;
    reportTargetBtn = btn || null;
    document.querySelectorAll('input[name="reportReason"]').forEach(r => r.checked = false);
    document.getElementById('reportCustomReason').value = '';
    document.getElementById('reportModal').style.display = 'flex';
    lucide.createIcons();
}

function closeReportModal() {
    document.getElementById('reportModal').style.display = 'none';
    reportTargetPostId = null;
    reportTargetBtn = null;
}

async function submitReport() {
    const selectedReason = document.querySelector('input[name="reportReason"]:checked');
    const customReason = document.getElementById('reportCustomReason').value.trim();

    if (!selectedReason) return;

    const category = selectedReason.value === 'Other' && customReason
        ? `Other: ${customReason}`
        : selectedReason.value;

    const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            type: 'moderation',
            category,
            description: customReason || selectedReason.value,
            postId: reportTargetPostId
        })
    });

    if (response.ok) {
        closeReportModal();
        if (reportTargetBtn) {
            reportTargetBtn.disabled = true;
            reportTargetBtn.style.opacity = '0.4';
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    lucide.createIcons();
    hydrateUserChrome();
    await loadGiphyKey();
    fetchPosts();

    const reportModal = document.getElementById('reportModal');
    if (reportModal) {
        reportModal.addEventListener('click', e => {
            if (e.target === reportModal) closeReportModal();
        });
    }
});

window.closeReportModal = closeReportModal;
window.submitReport = submitReport;