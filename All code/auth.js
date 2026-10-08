/**
 * Narsingdi District Student Council, MBSTU
 * Shared Authentication & Navigation Helper (auth.js)
 */

const API_BASE_URL = 'http://127.0.0.1:5000/api';

const MBSTU_DEPARTMENTS = [
    'CSE',
    'ICT',
    'TE',
    'ME',
    'ESRM',
    'CPS',
    'FTNS',
    'BGE',
    'BMB',
    'Pharmacy',
    'Chemistry',
    'Mathematics',
    'Physics',
    'Statistics',
    'Accounting',
    'Management',
    'BBA',
    'Economics',
    'English',
    'Veterinary Science and Animal Husbandry'
];

const Auth = {
    DEPARTMENTS: MBSTU_DEPARTMENTS,
    TOKEN_KEY: 'ndsc_token',
    USER_KEY: 'ndsc_user',
    LEGACY_ADMIN_TOKEN: 'ndsc_admin_token',
    LEGACY_ADMIN_USER: 'ndsc_admin_user',

    getToken() {
        return localStorage.getItem(this.TOKEN_KEY) || localStorage.getItem(this.LEGACY_ADMIN_TOKEN);
    },

    getUser() {
        const stored = localStorage.getItem(this.USER_KEY) || localStorage.getItem(this.LEGACY_ADMIN_USER);
        if (!stored) return null;
        try {
            return JSON.parse(stored);
        } catch (e) {
            return null;
        }
    },

    setSession(token, user) {
        if (token) {
            localStorage.setItem(this.TOKEN_KEY, token);
            localStorage.setItem(this.LEGACY_ADMIN_TOKEN, token);
        }
        if (user) {
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));
            localStorage.setItem(this.LEGACY_ADMIN_USER, JSON.stringify(user));
        }
    },

    clearSession() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        localStorage.removeItem(this.LEGACY_ADMIN_TOKEN);
        localStorage.removeItem(this.LEGACY_ADMIN_USER);
    },

    isLoggedIn() {
        return Boolean(this.getToken());
    },

    isAdmin() {
        const user = this.getUser();
        return Boolean(user && (user.role === 'admin' || user.role === 'superadmin'));
    },

    logout(redirectUrl = 'login.html') {
        if (confirm('Are you sure you want to sign out?')) {
            this.clearSession();
            window.location.href = redirectUrl;
        }
    },

    /**
     * Guards a page against unauthorized access.
     * @param {boolean} requireAdmin - If true, only admin role is allowed.
     */
    guardPage(requireAdmin = false) {
        if (!this.isLoggedIn()) {
            const currentPath = window.location.pathname.split('/').pop() || 'index.html';
            window.location.href = `login.html?redirect=${encodeURIComponent(currentPath)}`;
            return false;
        }

        if (requireAdmin && !this.isAdmin()) {
            window.location.href = 'dashboard.html';
            return false;
        }

        return true;
    },

    /**
     * Verifies the stored JWT token with the server.
     */
    async verifySession() {
        const token = this.getToken();
        if (!token) return null;

                try {
            const res = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.user) {
                this.setSession(token, data.user);
                return data.user;
            } else {
                // If invalid or expired, clear session
                this.clearSession();
                return null;
            }
        } catch (err) {
            console.warn('Offline or error verifying session with server:', err);
            // Fall back to cached user in localStorage
            return this.getUser();
        }
    },

    /**
     * Renders common navigation elements: active page, login/register or user/dashboard links.
     */
    renderNavbar(activePage = '') {
        const user = this.getUser();
        const loggedIn = this.isLoggedIn();
        const isAdminUser = this.isAdmin();

        // 1. Highlight active navigation links
        const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
        navLinks.forEach(link => {
            const pageAttr = link.getAttribute('data-page');
            const href = link.getAttribute('href') || '';
            if ((pageAttr && pageAttr === activePage) || (href && href.includes(activePage + '.html'))) {
                link.classList.add('active');
            } else if (activePage === 'home' && (href === 'index.html' || href === '#home' || href === '/')) {
                link.classList.add('active');
            }
        });

        // 2. Render Desktop Dynamic Nav Items
        const navMenu = document.getElementById('mainNavMenu');
        if (navMenu) {
            // Append Dashboard if logged in
            if (loggedIn) {
                if (!document.getElementById('navDashboardLink')) {
                    const dashLink = document.createElement('a');
                    dashLink.href = 'dashboard.html';
                    dashLink.className = `nav-link ${activePage === 'dashboard' ? 'active' : ''}`;
                    dashLink.id = 'navDashboardLink';
                    dashLink.textContent = 'Dashboard';
                    navMenu.appendChild(dashLink);
                }

                // Append prominent Admin Portal if admin
                const existingAdminLink = document.getElementById('navAdminLink');
                if (isAdminUser) {
                    if (!existingAdminLink) {
                        const adminLink = document.createElement('a');
                        adminLink.href = 'admin.html';
                        adminLink.className = `nav-link nav-admin-portal-link ${activePage === 'admin' ? 'active' : ''}`;
                        adminLink.id = 'navAdminLink';
                        adminLink.innerHTML = `<i data-lucide="shield" class="icon-xs"></i> Admin Portal`;
                        navMenu.appendChild(adminLink);
                    }
                } else if (existingAdminLink) {
                    existingAdminLink.remove();
                }
            } else {
                const dLink = document.getElementById('navDashboardLink');
                if (dLink) dLink.remove();
                const aLink = document.getElementById('navAdminLink');
                if (aLink) aLink.remove();
            }
        }

        // 3. Render Desktop Auth Action Buttons
        const navAuthWrapper = document.getElementById('navAuthWrapper');
        if (navAuthWrapper) {
            if (loggedIn && user) {
                const displayName = user.name || user.username || 'Student Member';
                const roleBadge = isAdminUser
                    ? `<span class="badge-role-admin"><i data-lucide="shield" class="icon-xs"></i> Admin</span>`
                    : `<span class="badge-role-user">Member</span>`;

                navAuthWrapper.innerHTML = `
                    <a href="profile.html" class="user-logged-badge" title="View Profile">
                        <span class="user-avatar-dot"></span>
                        <span class="truncate" style="max-width: 120px;">${displayName}</span>
                        ${roleBadge}
                    </a>
                    <button id="logoutNavBtn" class="btn-logout" type="button" title="Sign Out">
                        <i data-lucide="log-out" class="icon-xs"></i>
                        <span>Logout</span>
                    </button>
                `;

                const logoutBtn = document.getElementById('logoutNavBtn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', () => Auth.logout());
                }
            } else {
                navAuthWrapper.innerHTML = `
                    <div class="nav-auth-group">
                        <a href="login.html" class="btn-secondary-compact">
                            <i data-lucide="log-in" class="icon-xs"></i>
                            <span>Login</span>
                        </a>
                        <a href="register.html" class="btn-primary-compact">
                            <i data-lucide="user-plus" class="icon-xs"></i>
                            <span>Register</span>
                        </a>
                    </div>
                `;
            }
        }

        // 4. Render Mobile Drawer Links
        const mobileNavMenu = document.getElementById('mobileNavMenu');
        const mobileAuthWrapper = document.getElementById('mobileAuthWrapper');

        if (mobileNavMenu) {
            if (loggedIn) {
                if (!document.getElementById('mobileNavDashLink')) {
                    const mDash = document.createElement('a');
                    mDash.href = 'dashboard.html';
                    mDash.className = `mobile-nav-link ${activePage === 'dashboard' ? 'active' : ''}`;
                    mDash.id = 'mobileNavDashLink';
                    mDash.innerHTML = `<i data-lucide="layout-dashboard" class="icon-xs"></i> Dashboard`;
                    mobileNavMenu.appendChild(mDash);
                }
                if (!document.getElementById('mobileNavProfileLink')) {
                    const mProfile = document.createElement('a');
                    mProfile.href = 'profile.html';
                    mProfile.className = `mobile-nav-link ${activePage === 'profile' ? 'active' : ''}`;
                    mProfile.id = 'mobileNavProfileLink';
                    mProfile.innerHTML = `<i data-lucide="user" class="icon-xs"></i> Profile`;
                    mobileNavMenu.appendChild(mProfile);
                }

                const existingMobileAdmin = document.getElementById('mobileNavAdminLink');
                if (isAdminUser) {
                    if (!existingMobileAdmin) {
                        const mAdmin = document.createElement('a');
                        mAdmin.href = 'admin.html';
                        mAdmin.className = `mobile-nav-link ${activePage === 'admin' ? 'active' : ''}`;
                        mAdmin.id = 'mobileNavAdminLink';
                        mAdmin.style.color = 'var(--color-amber)';
                        mAdmin.innerHTML = `<i data-lucide="shield" class="icon-xs text-amber"></i> Admin Portal`;
                        mobileNavMenu.appendChild(mAdmin);
                    }
                } else if (existingMobileAdmin) {
                    existingMobileAdmin.remove();
                }
            }
        }

        if (mobileAuthWrapper) {
            if (loggedIn && user) {
                mobileAuthWrapper.innerHTML = `
                    <div style="padding: 12px 0;">
                        <button id="mobileLogoutBtn" class="btn-logout w-full" style="justify-content: center; padding: 10px;" type="button">
                            <i data-lucide="log-out" class="icon-xs"></i>
                            <span>Sign Out (${user.name || user.username})</span>
                        </button>
                    </div>
                `;
                const mLogout = document.getElementById('mobileLogoutBtn');
                if (mLogout) {
                    mLogout.addEventListener('click', () => Auth.logout());
                }
            } else {
                mobileAuthWrapper.innerHTML = `
                    <div style="display: flex; gap: 10px; padding: 12px 0;">
                        <a href="login.html" class="btn-secondary-compact flex-grow" style="justify-content: center;">
                            <i data-lucide="log-in" class="icon-xs"></i>
                            <span>Login</span>
                        </a>
                        <a href="register.html" class="btn-primary-compact flex-grow" style="justify-content: center;">
                            <i data-lucide="user-plus" class="icon-xs"></i>
                            <span>Register</span>
                        </a>
                    </div>
                `;
            }
        }

        // Re-render Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },

    /**
     * Initializes common interactivity: mobile drawer, back to top button, Lucide icons.
     */
    initCommonUI() {
        // Mobile Drawer Toggle
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const mobileDrawer = document.getElementById('mobileDrawer');
        const menuIcon = document.getElementById('menuIcon');

        if (mobileMenuToggle && mobileDrawer) {
            mobileMenuToggle.addEventListener('click', () => {
                mobileDrawer.classList.toggle('open');
                const isOpen = mobileDrawer.classList.contains('open');
                if (menuIcon) {
                    menuIcon.setAttribute('data-lucide', isOpen ? 'x' : 'menu');
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                }
            });
        }

        // Back to top button
        const backToTopBtn = document.getElementById('backToTop');
        if (backToTopBtn) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 400) {
                    backToTopBtn.classList.remove('hidden');
                } else {
                    backToTopBtn.classList.add('hidden');
                }
            });
            backToTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        // Initialize icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
};

// Expose Auth globally on window
if (typeof window !== 'undefined') {
    window.Auth = Auth;
}

// Auto-initialize when script loads
document.addEventListener('DOMContentLoaded', () => {
    Auth.initCommonUI();
});
