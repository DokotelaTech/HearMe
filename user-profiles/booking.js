document.addEventListener('DOMContentLoaded', async () => {
    const urlParams  = new URLSearchParams(window.location.search);
    const expertName = urlParams.get('expert') || "your Therapist";
    document.getElementById('expert-name-title').innerText = `Book a Session with ${expertName}`;

    let selectedTime = null;
    let selectedDay  = null;

    const loadingText = document.getElementById('loading-text');
    const container   = document.getElementById('availability-container');
    const confirmBtn  = document.getElementById('confirm-booking-btn');

    // ── FETCH AVAILABILITY ──────────────────────────────────────
    try {
        const response = await fetch('http://localhost:5000/api/availability');
        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        const availabilities = await response.json();
        loadingText.style.display = 'none';

        const activeDays = availabilities.filter(day => day.is_active === true);

        if (activeDays.length === 0) {
            container.innerHTML = `
                <div style="padding:20px;background:#fef9c3;border-radius:10px;color:#854d0e;border:1px solid #fde047;">
                    ⚠️ This therapist hasn't configured their availability yet. Please check back later.
                </div>`;
            return;
        }

        // Render a slot grid for each active day
        activeDays.forEach(day => {
            const section = document.createElement('div');
            section.style.marginBottom = '28px';
            section.innerHTML = `
                <h3 style="font-size:1rem;font-weight:700;color:#1e293b;margin-bottom:12px;">
                    📅 ${day.day_of_week}
                    <span style="font-size:0.8rem;font-weight:400;color:#64748b;margin-left:8px;">
                        ${day.start_time || '09:00 AM'} – ${day.end_time || '05:00 PM'}
                    </span>
                </h3>`;

            const grid = document.createElement('div');
            grid.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;';

            const slots = ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM'];

            slots.forEach(time => {
                const btn = document.createElement('button');
                btn.innerText   = time;
                btn.className   = 'slot-btn';
                btn.style.cssText = `
                    padding:10px 18px;border:2px solid #e2e8f0;border-radius:8px;
                    background:white;color:#334155;font-size:0.88rem;font-weight:500;
                    cursor:pointer;transition:all 0.2s;font-family:inherit;`;

                btn.onmouseenter = () => {
                    if (!btn.classList.contains('selected')) {
                        btn.style.borderColor = '#a855f7';
                        btn.style.color       = '#a855f7';
                    }
                };
                btn.onmouseleave = () => {
                    if (!btn.classList.contains('selected')) {
                        btn.style.borderColor = '#e2e8f0';
                        btn.style.color       = '#334155';
                    }
                };

                btn.onclick = () => {
                    document.querySelectorAll('.slot-btn').forEach(b => {
                        b.classList.remove('selected');
                        b.style.background  = 'white';
                        b.style.borderColor = '#e2e8f0';
                        b.style.color       = '#334155';
                    });
                    btn.classList.add('selected');
                    btn.style.background  = '#a855f7';
                    btn.style.borderColor = '#a855f7';
                    btn.style.color       = 'white';

                    selectedTime = time;
                    selectedDay  = day.day_of_week;

                    confirmBtn.style.display = 'block';
                    confirmBtn.innerText     = `Confirm — ${day.day_of_week} at ${time}`;
                };

                grid.appendChild(btn);
            });

            section.appendChild(grid);
            container.appendChild(section);
        });

    } catch (error) {
        console.error("Error loading availability:", error);
        loadingText.innerText   = "❌ Failed to load availability. Is the server running on port 5000?";
        loadingText.style.color = '#ef4444';
    }

    // ── CONFIRM BOOKING ─────────────────────────────────────────
    confirmBtn.addEventListener('click', async () => {
        if (!selectedTime || !selectedDay) return;

        const originalText    = confirmBtn.innerText;
        confirmBtn.innerText  = 'Booking...';
        confirmBtn.disabled   = true;

        try {
            const res = await fetch('http://localhost:5000/api/appointments', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client_id:     "Patient_User_1",
                    start_time:    selectedTime,
                    duration_mins: 50,
                    status:        'CONFIRMED',
                    session_notes: `Booked via Patient Portal with ${expertName} on ${selectedDay}`
                })
            });

            if (res.ok) {
                // ── SUCCESS: replace container content in place ──
                loadingText.style.display = 'none';
                confirmBtn.style.display  = 'none';
                container.innerHTML = `
                    <div style="text-align:center;padding:40px 20px;">
                        <div style="font-size:3rem;margin-bottom:16px;">✅</div>
                        <h2 style="font-size:1.4rem;font-weight:700;color:#0f172a;margin-bottom:8px;">
                            Appointment Confirmed!
                        </h2>
                        <p style="color:#64748b;margin-bottom:6px;">
                            <strong>${expertName}</strong>
                        </p>
                        <p style="color:#64748b;margin-bottom:24px;">
                            ${selectedDay} at ${selectedTime} &nbsp;•&nbsp; 50 minutes
                        </p>
                        <a href="experts.html" style="
                            display:inline-block;padding:12px 28px;
                            background:linear-gradient(135deg,#a855f7,#7c3aed);
                            color:white;border-radius:10px;text-decoration:none;
                            font-weight:600;font-size:0.95rem;">
                            Back to Experts
                        </a>
                    </div>`;
            } else {
                const err = await res.json();
                alert(`❌ Booking failed: ${err.message}`);
                confirmBtn.innerText = originalText;
                confirmBtn.disabled  = false;
            }
        } catch (error) {
            console.error("Network error:", error);
            alert("❌ Network error. Is the server running?");
            confirmBtn.innerText = originalText;
            confirmBtn.disabled  = false;
        }
    });
});