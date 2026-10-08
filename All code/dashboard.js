/**
 * Narsingdi District Student Council, MBSTU
 * User Dashboard Page Logic (dashboard.js)
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Guard page - redirect to login if unauthenticated
    if (!Auth.guardPage()) return;

    // 2. Render Navbar
    Auth.renderNavbar('dashboard');
    const API_BASE_URL = 'http://127.0.0.1:5000/api';

    const token = Auth.getToken();
    const welcomeName = document.getElementById('dashWelcomeName');
    const welcomeRoleBadge = document.getElementById('dashRoleBadge');
    const welcomeMeta = document.getElementById('dashWelcomeMeta');
    const userAvatarInitials = document.getElementById('dashAvatarInitials');
    const avatarImg = document.getElementById('dashAvatarImg');

    const statName = document.getElementById('statName');
    const statEmail = document.getElementById('statEmail');
    const statDept = document.getElementById('statDept');
    const statSession = document.getElementById('statSession');
    const statUpazila = document.getElementById('statUpazila');
    const statPhone = document.getElementById('statPhone');
    const statWhatsApp = document.getElementById('statWhatsApp');
    const statJoined = document.getElementById('statJoined');
    const adminActionCard = document.getElementById('dashAdminActionCard');
    const dashLogoutBtn = document.getElementById('dashLogoutBtn');

    // Logout button
    if (dashLogoutBtn) {
        dashLogoutBtn.addEventListener('click', () => Auth.logout());
    }

    try {
        const res = await fetch('http://127.0.0.1:5000/api/users/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.success && data.user) {
            const user = data.user;
            Auth.setSession(token, user);
            Auth.renderNavbar('dashboard');

            const displayName = user.name || user.username || 'Council Member';
            if (welcomeName) welcomeName.textContent = displayName;

            // Avatar & Initials
            const initials = displayName
                .split(' ')
                .map(n => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase() || 'U';

            if (user.profilePicture && avatarImg) {
                avatarImg.src = user.profilePicture;
                avatarImg.classList.remove('hidden');
                if (userAvatarInitials) userAvatarInitials.classList.add('hidden');
            } else if (userAvatarInitials) {
                userAvatarInitials.textContent = initials;
                userAvatarInitials.classList.remove('hidden');
                if (avatarImg) avatarImg.classList.add('hidden');
            }

            // Role Badge
            const isAdmin = user.role === 'admin' || user.role === 'superadmin';
            if (welcomeRoleBadge) {
                welcomeRoleBadge.innerHTML = isAdmin
                    ? `<span class="badge-role-admin"><i data-lucide="shield" class="icon-xs"></i> Administrator</span>`
                    : `<span class="badge-role-user"><i data-lucide="check" class="icon-xs"></i> General Member</span>`;
            }

            if (welcomeMeta) {
                const deptStr = user.department ? `${user.department}` : 'MBSTU';
                const sessionStr = user.session ? ` • Session ${user.session}` : '';
                const upazilaStr = user.upazila ? ` • Upazila: ${user.upazila}` : '';
                welcomeMeta.textContent = `${deptStr}${sessionStr}${upazilaStr}`;
            }

            // Stat Cards
            if (statName) statName.textContent = displayName;
            if (statEmail) statEmail.textContent = user.email || 'Not provided';
            if (statDept) statDept.textContent = user.department || 'Not specified';
            if (statSession) statSession.textContent = user.session || 'Not specified';
            if (statUpazila) statUpazila.textContent = user.upazila || 'Not specified';
            if (statPhone) statPhone.textContent = user.phone || 'Not specified';
            if (statWhatsApp) statWhatsApp.textContent = user.whatsapp || user.phone || 'Not specified';
            if (statJoined) {
                const joinedDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recently';
                statJoined.textContent = joinedDate;
            }

            // Admin Portal Card visible only for admins
            if (isAdmin && adminActionCard) {
                adminActionCard.classList.remove('hidden');
            }

            if (typeof lucide !== 'undefined') lucide.createIcons();
        } else {
            // Session expired or invalid
            Auth.clearSession();
            window.location.href = 'login.html';
        }
    } catch (err) {
        console.error('Error fetching dashboard user data:', err);
    }

    // Load recent notices in dashboard
    async function loadRecentNotices() {
        const noticesContainer = document.getElementById('dashRecentNotices');
        if (!noticesContainer) return;

        try {
            const res = await fetch('http://127.0.0.1:5000/api/notices');
            const data = await res.json();
            if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                const recent = data.data.slice(0, 3);
                noticesContainer.innerHTML = recent.map(n => `
                    <div class="glass-card" style="padding: 16px 20px; border-radius: var(--radius-sm); margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; gap: 14px;">
                        <div>
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                                <span class="badge-small bg-sky-light text-sky">${n.category}</span>
                                <span style="font-size: 0.75rem; color: var(--color-text-muted);">${n.date}</span>
                            </div>
                            <h4 style="font-size: 0.95rem; font-weight: 700; color: #fff;">${n.title}</h4>
                        </div>
                        <a href="notices.html" class="btn-text" style="white-space: nowrap;">Read &rarr;</a>
                    </div>
                `).join('');
            } else {
                noticesContainer.innerHTML = `<p style="color: var(--color-text-muted); font-size: 0.88rem;">No recent announcements available.</p>`;
            }
        } catch (e) {
            console.warn('Failed to load notices widget:', e);
        }
    }

    loadRecentNotices();
});
