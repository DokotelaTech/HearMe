// =========================================
// THERAPIST REPORT PAGE — report.js
// =========================================

// const API_BASE = 'http://localhost:5000/api';

// =========================================
// CATEGORY SELECTOR
// =========================================
const categoryBtns = document.querySelectorAll('.cat-btn');
const categoryInput = document.getElementById('report-category-input');

categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active from all
        categoryBtns.forEach(b => {
            b.style.border = '1px solid #e5e7eb';
            b.style.background = 'white';
            b.style.color = 'inherit';
            b.classList.remove('active');
        });

        // Activate clicked
        btn.style.border = '1px solid #3b82f6';
        btn.style.background = '#eff6ff';
        btn.style.color = '#1d4ed8';
        btn.classList.add('active');

        categoryInput.value = btn.getAttribute('data-type');
    });
});

// =========================================
// SUBMIT REPORT
// =========================================
const form = document.getElementById('report-issue-form');

form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const category = categoryInput.value;
    const description = document.getElementById('report-description-input').value.trim();
    const submitBtn = form.querySelector('button[type="submit"]');

    if (!description) {
        showToast('Please provide a description.', 'error');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';

    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/reports`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ category, description })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Submission failed');

        showToast('Report submitted successfully!', 'success');
        form.reset();

        // Reset category selector back to default
        categoryBtns.forEach(b => {
            b.style.border = '1px solid #e5e7eb';
            b.style.background = 'white';
            b.style.color = 'inherit';
            b.classList.remove('active');
        });
        const firstBtn = categoryBtns[0];
        if (firstBtn) {
            firstBtn.style.border = '1px solid #3b82f6';
            firstBtn.style.background = '#eff6ff';
            firstBtn.style.color = '#1d4ed8';
            firstBtn.classList.add('active');
            categoryInput.value = firstBtn.getAttribute('data-type');
        }

        // Reload recent reports sidebar
        loadMyReports();

    } catch (err) {
        showToast(err.message || 'Error submitting report.', 'error');
        console.error(err);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-regular fa-paper-plane"></i> Submit Report to Admin';
    }
});

// =========================================
// LOAD MY RECENT REPORTS (sidebar)
// =========================================
async function loadMyReports() {
    const container = document.getElementById('recent-reports-container');
    if (!container) return;

    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/reports/my`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();
        const reports = data.reports || [];

        if (reports.length === 0) {
            container.innerHTML = `<p style="color:#94a3b8; font-size:13px; text-align:center; padding:20px 0;">No reports submitted yet.</p>`;
            return;
        }

        const categoryIcons = {
            technical: { icon: 'fa-wrench',           color: '#3b82f6' },
            client:    { icon: 'fa-user',              color: '#8b5cf6' },
            safety:    { icon: 'fa-shield-halved',     color: '#ef4444' }
        };

        const statusConfig = {
            pending:  { text: 'Pending',  bg: '#fef3c7', color: '#d97706' },
            reviewed: { text: 'Reviewed', bg: '#e0f2fe', color: '#0284c7' },
            resolved: { text: 'Resolved', bg: '#dcfce7', color: '#16a34a' }
        };

        container.innerHTML = reports.map(r => {
            const cat = categoryIcons[r.category] || categoryIcons.technical;
            const stat = statusConfig[r.status] || statusConfig.pending;
            const date = new Date(r.createdAt).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
            });

            return `
                <div style="border:1px solid #f1f5f9; border-radius:8px; padding:12px; margin-bottom:10px;">
                    <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
                        <div style="background:#f8fafc; width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                            <i class="fa-solid ${cat.icon}" style="color:${cat.color}; font-size:13px;"></i>
                        </div>
                        <div style="flex:1; min-width:0;">
                            <p style="margin:0; font-size:13px; font-weight:600; text-transform:capitalize;">${r.category} Issue</p>
                            <p style="margin:0; font-size:11px; color:#94a3b8;">${date}</p>
                        </div>
                        <span style="background:${stat.bg}; color:${stat.color}; padding:2px 8px; border-radius:20px; font-size:11px; font-weight:600; white-space:nowrap;">
                            ${stat.text}
                        </span>
                    </div>
                    <p style="margin:0; font-size:12px; color:#64748b; line-height:1.5; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">
                        ${r.description}
                    </p>
                    ${r.adminNote ? `
                    <div style="margin-top:8px; background:#f8fafc; border-left:3px solid #3b82f6; padding:8px 10px; border-radius:4px;">
                        <p style="margin:0; font-size:11px; color:#1d4ed8; font-weight:600;">Admin Response:</p>
                        <p style="margin:4px 0 0 0; font-size:12px; color:#334155;">${r.adminNote}</p>
                    </div>` : ''}
                </div>`;
        }).join('');

    } catch (err) {
        console.error('Load reports error:', err);
        container.innerHTML = `<p style="color:#ef4444; font-size:13px;">Could not load reports.</p>`;
    }
}

// =========================================
// TOAST NOTIFICATION
// =========================================
function showToast(message, type = 'success') {
    const existing = document.getElementById('report-toast');
    if (existing) existing.remove();

    const bg = type === 'success' ? '#16a34a' : '#dc2626';
    const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-xmark';

    const toast = document.createElement('div');
    toast.id = 'report-toast';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> ${message}`;
    toast.style.cssText = `
        position: fixed; bottom: 24px; right: 24px;
        background: ${bg}; color: white;
        padding: 12px 20px; border-radius: 10px;
        font-size: 14px; font-weight: 500;
        display: flex; align-items: center; gap: 10px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        z-index: 9999; animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

// =========================================
// INIT
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    loadMyReports();
});