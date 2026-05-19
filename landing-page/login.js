document.addEventListener('DOMContentLoaded', () => {

    const roleOptions = document.querySelectorAll('.role-option');
    let selectedRole = 'user';

    roleOptions.forEach(option => {
        option.addEventListener('click', () => {
            roleOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            selectedRole = option.dataset.role;
        });
    });

    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    role: selectedRole,
                    email,
                    password
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Login successful!');
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.user.role);
                localStorage.setItem('anonymousName', data.user.anonymousName || '');

                if (selectedRole === 'user') {
                    window.location.href = '../user/dashboard.html';
                } else if (selectedRole === 'therapist') {
                    window.location.href = '../Therapistportal/portal.html';
                } else {
                    window.location.href = '../admin/dashboard.html';
                }
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.log(err);
            alert('Server connection failed');
        }
    });
});