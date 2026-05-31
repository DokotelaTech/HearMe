(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    function setAvatar(element, imageUrl, fallback) {
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

    async function hydrateAvatar() {
        try {
            const response = await fetch('http://localhost:5000/api/user/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            const fallback = (data.identifier || 'User').charAt(0).toUpperCase();
            document.querySelectorAll('.user-avatar').forEach(avatar => {
                setAvatar(avatar, data.profileImage, fallback);
            });
        } catch (error) {
            document.querySelectorAll('.user-avatar').forEach(avatar => {
                if (!avatar.textContent.trim()) avatar.textContent = 'U';
            });
        }
    }

    document.addEventListener('DOMContentLoaded', hydrateAvatar);
})();
