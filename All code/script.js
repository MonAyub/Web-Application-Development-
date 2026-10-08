/* 
========================================================================
   Narsingdi District Student Council, MBSTU - Official Script File
   Full-Stack Dynamic Frontend: REST API Integration & Admin Portal
========================================================================
*/

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Landing Auth Gate: Redirect unauthenticated users to login.html
    if (typeof Auth !== 'undefined') {
        if (!Auth.guardPage()) return;
        Auth.renderNavbar('home');
        await Auth.verifySession();
        Auth.renderNavbar('home');
    }

    // Helper: Initialize Lucide Icons
    function renderIcons() {
        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }
    }
    renderIcons();

    // --- DOM Elements Cache ---
    const API_BASE_URL = 'http://127.0.0.1:5000/api';
    const body = document.body;
    const backToTopBtn = document.getElementById("backToTop");
    const mobileMenuToggle = document.getElementById("mobileMenuToggle");
    const mobileDrawer = document.getElementById("mobileDrawer");
    const menuIcon = document.getElementById("menuIcon");
    const navLinks = document.querySelectorAll(".nav-link");
    const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");
    const scrollSections = document.querySelectorAll(".scroll-section");
    const navLogoBtn = document.getElementById("navLogoBtn");

    // Toast element
    const copyToast = document.getElementById("copyToast");
    const toastText = document.getElementById("toastText");

    function showToast(message, isSuccess = true) {
        if (!copyToast) return;
        toastText.textContent = message;
        copyToast.classList.remove("hidden");
        setTimeout(() => {
            copyToast.classList.add("hidden");
        }, 3500);
    }

    // ==================== 1. NAVIGATION & STICKY NAV ====================
    if (mobileMenuToggle && mobileDrawer) {
        mobileMenuToggle.addEventListener("click", () => {
            mobileDrawer.classList.toggle("open");
            const isOpen = mobileDrawer.classList.contains("open");
            if (isOpen) {
                menuIcon.setAttribute("data-lucide", "x");
            } else {
                menuIcon.setAttribute("data-lucide", "menu");
            }
            renderIcons();
        });
    }

    const allNavLinks = [...navLinks, ...mobileNavLinks];
    allNavLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            const href = link.getAttribute("href");
            if (!href || !href.startsWith("#")) return;
            e.preventDefault();
            const targetId = href.substring(1);
            const targetSection = document.getElementById(targetId);

            if (mobileDrawer) {
                mobileDrawer.classList.remove("open");
                if (menuIcon) {
                    menuIcon.setAttribute("data-lucide", "menu");
                    renderIcons();
                }
            }

            if (targetSection) {
                targetSection.scrollIntoView({ behavior: "smooth" });
            }
        });
    });

    if (navLogoBtn) {
        navLogoBtn.addEventListener("click", (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    window.addEventListener("scroll", () => {
        const scrollPosition = window.scrollY + 250;
        let currentSectionId = "home";

        scrollSections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            if (scrollPosition >= top && scrollPosition < top + height) {
                currentSectionId = section.getAttribute("id");
            }
        });

        navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${currentSectionId}`) {
                link.classList.add("active");
            }
        });

        mobileNavLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${currentSectionId}`) {
                link.classList.add("active");
            }
        });

        if (window.scrollY > 600) {
            if (backToTopBtn) backToTopBtn.classList.remove("hidden");
        } else {
            if (backToTopBtn) backToTopBtn.classList.add("hidden");
        }
    });

    if (backToTopBtn) {
        backToTopBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    // ==================== 2. SCROLL REVEAL ANIMATIONS ====================
    scrollSections.forEach(section => section.classList.add("reveal"));
    document.querySelector(".badge")?.classList.add("reveal");
    document.querySelector(".main-title")?.classList.add("reveal");
    document.querySelector(".sub-title")?.classList.add("reveal");
    document.querySelector(".intro-text")?.classList.add("reveal");
    document.querySelector(".hero-actions")?.classList.add("reveal");
    document.querySelector(".stats-grid")?.classList.add("reveal");
    document.querySelector(".notice-ticker-banner")?.classList.add("reveal");
    document.querySelectorAll(".leadership-card")?.forEach(c => c.classList.add("reveal"));

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05 });

    document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));
    document.querySelectorAll(".timeline-item").forEach(item => {
        item.classList.add("reveal");
        revealObserver.observe(item);
    });

    // ==================== 3. ADMIN AUTHENTICATION STATE ====================
    let isAdminLoggedIn = false;
    let currentUser = null;

    const adminLoginNavBtn = document.getElementById("adminLoginNavBtn");
    const mobileAdminLoginNavBtn = document.getElementById("mobileAdminLoginNavBtn");
    const adminLoggedInBadge = document.getElementById("adminLoggedInBadge");
    const adminUserName = document.getElementById("adminUserName");
    const adminLogoutBtn = document.getElementById("adminLogoutBtn");

    const adminMemberControls = document.getElementById("adminMemberControls");
    const adminEventControls = document.getElementById("adminEventControls");
    const adminNoticeControls = document.getElementById("adminNoticeControls");

    const adminLoginModal = document.getElementById("adminLoginModal");
    const adminLoginCloseBtn = document.getElementById("adminLoginCloseBtn");
    const adminLoginBackdropClose = document.getElementById("adminLoginBackdropClose");
    const adminLoginForm = document.getElementById("adminLoginForm");
    const adminUsernameInput = document.getElementById("adminUsernameInput");
    const adminPasswordInput = document.getElementById("adminPasswordInput");
    const adminLoginError = document.getElementById("adminLoginError");

    function getAuthToken() {
        if (typeof Auth !== 'undefined' && Auth.getToken()) {
            return Auth.getToken();
        }
        return localStorage.getItem("ndsc_token") || localStorage.getItem("ndsc_admin_token");
    }

    function setAuthToken(token, user) {
        if (typeof Auth !== 'undefined') {
            Auth.setSession(token, user);
        } else {
            localStorage.setItem("ndsc_token", token);
            localStorage.setItem("ndsc_admin_token", token);
            if (user) {
                localStorage.setItem("ndsc_user", JSON.stringify(user));
                localStorage.setItem("ndsc_admin_user", JSON.stringify(user));
            }
        }
    }

    function removeAuthToken() {
        if (typeof Auth !== 'undefined') {
            Auth.clearSession();
        } else {
            localStorage.removeItem("ndsc_token");
            localStorage.removeItem("ndsc_user");
            localStorage.removeItem("ndsc_admin_token");
            localStorage.removeItem("ndsc_admin_user");
        }
    }

    function updateAdminUI(isLoggedIn, user = null) {
        const isAdmin = Boolean(isLoggedIn && (typeof Auth !== 'undefined' ? Auth.isAdmin() : (user && (user.role === 'admin' || user.role === 'superadmin'))));
        isAdminLoggedIn = isAdmin;
        currentUser = user || (typeof Auth !== 'undefined' ? Auth.getUser() : null);

        if (isAdmin) {
            if (adminLoginNavBtn) adminLoginNavBtn.classList.add("hidden");
            if (mobileAdminLoginNavBtn) mobileAdminLoginNavBtn.classList.add("hidden");
            if (adminLoggedInBadge) adminLoggedInBadge.classList.remove("hidden");
            if (adminUserName && currentUser) adminUserName.textContent = currentUser.name || currentUser.username || "Admin";

            if (adminMemberControls) adminMemberControls.classList.remove("hidden");
            if (adminEventControls) adminEventControls.classList.remove("hidden");
            if (adminNoticeControls) adminNoticeControls.classList.remove("hidden");
        } else {
            if (adminLoginNavBtn) adminLoginNavBtn.classList.remove("hidden");
            if (mobileAdminLoginNavBtn) mobileAdminLoginNavBtn.classList.remove("hidden");
            if (adminLoggedInBadge) adminLoggedInBadge.classList.add("hidden");

            if (adminMemberControls) adminMemberControls.classList.add("hidden");
            if (adminEventControls) adminEventControls.classList.add("hidden");
            if (adminNoticeControls) adminNoticeControls.classList.add("hidden");
        }

        // Re-render components so delete buttons appear/disappear according to role
        renderMembers();
        renderEvents();
        renderNotices();
    }

    async function verifyAdminAuth() {
        if (typeof Auth !== 'undefined') {
            const user = Auth.getUser();
            const isAdmin = Auth.isAdmin();
            updateAdminUI(isAdmin, user);
            return;
        }

        const token = getAuthToken();
        if (!token) {
            updateAdminUI(false);
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.user) {
                const isAdmin = data.user.role === 'admin' || data.user.role === 'superadmin';
                updateAdminUI(isAdmin, data.user);
            } else {
                updateAdminUI(false);
            }
        } catch (err) {
            console.error("Auth verification failed:", err);
            const cachedUser = localStorage.getItem("ndsc_user") || localStorage.getItem("ndsc_admin_user");
            if (cachedUser) {
                try {
                    const u = JSON.parse(cachedUser);
                    const isAdmin = u.role === 'admin' || u.role === 'superadmin';
                    updateAdminUI(isAdmin, u);
                } catch(e) {
                    updateAdminUI(false);
                }
            } else {
                updateAdminUI(false);
            }
        }
    }

    function openAdminLoginModal() {
        if (adminLoginModal) {
            adminLoginModal.classList.remove("hidden");
            if (adminLoginError) adminLoginError.classList.add("hidden");
            if (adminUsernameInput) adminUsernameInput.focus();
            body.style.overflow = "hidden";
        }
    }

    function closeAdminLoginModal() {
        if (adminLoginModal) {
            adminLoginModal.classList.add("hidden");
            body.style.overflow = "";
        }
    }

    if (adminLoginNavBtn) adminLoginNavBtn.addEventListener("click", openAdminLoginModal);
    if (mobileAdminLoginNavBtn) {
        mobileAdminLoginNavBtn.addEventListener("click", () => {
            if (mobileDrawer) mobileDrawer.classList.remove("open");
            openAdminLoginModal();
        });
    }
    if (adminLoginCloseBtn) adminLoginCloseBtn.addEventListener("click", closeAdminLoginModal);
    if (adminLoginBackdropClose) adminLoginBackdropClose.addEventListener("click", closeAdminLoginModal);

    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener("click", () => {
            if (confirm("Are you sure you want to log out from the Admin Portal?")) {
                removeAuthToken();
                updateAdminUI(false);
                showToast("Logged out successfully.");
            }
        });
    }

    if (adminLoginForm) {
        adminLoginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const username = adminUsernameInput.value.trim();
            const password = adminPasswordInput.value.trim();

            if (!username || !password) return;

            try {
                const res = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password })
                });

                const data = await res.json();
                if (data.success && data.token) {
                    setAuthToken(data.token, data.user);
                    updateAdminUI(true, data.user);
                    closeAdminLoginModal();
                    adminLoginForm.reset();
                    showToast(`Welcome back, ${data.user.username}!`);
                } else {
                    if (adminLoginError) {
                        adminLoginError.textContent = data.error || "Login failed. Please check credentials.";
                        adminLoginError.classList.remove("hidden");
                    }
                }
            } catch (err) {
                if (adminLoginError) {
                    adminLoginError.textContent = "Network error. Please make sure the backend server is running.";
                    adminLoginError.classList.remove("hidden");
                }
            }
        });
    }


    // ==================== 4. MEMBER DIRECTORY API INTEGRATION ====================
    let allMembers = [];
    const membersGrid = document.getElementById("membersGrid");
    const memberSearchInput = document.getElementById("memberSearchInput");
    const filterUpazila = document.getElementById("filterUpazila");
    const filterDepartment = document.getElementById("filterDepartment");
    const filterSession = document.getElementById("filterSession");
    const resetFiltersBtn = document.getElementById("resetFiltersBtn");
    const memberCountText = document.getElementById("memberCountText");
    const noResultsText = document.getElementById("noResultsText");
    const membersEmptyState = document.getElementById("membersEmptyState");
    const emptyStateResetBtn = document.getElementById("emptyStateResetBtn");

    async function fetchMembers() {
        try {
            const res = await fetch(`${API_BASE_URL}/members`);
            const result = await res.json();
            if (result.success && Array.isArray(result.data)) {
                allMembers = result.data;
                populateMemberFilters();
                renderMembers();
            }
        } catch (err) {
            console.error("Failed to fetch members from API:", err);
            // Fallback: parse existing DOM members if any
            parseFallbackMembers();
        }
    }

    function parseFallbackMembers() {
        const domCards = membersGrid ? membersGrid.querySelectorAll(".member-card") : [];
        if (domCards.length > 0 && allMembers.length === 0) {
            domCards.forEach(card => {
                allMembers.push({
                    _id: card.getAttribute("data-id") || Math.random().toString(),
                    name: card.getAttribute("data-name") || "",
                    department: card.getAttribute("data-department") || "",
                    session: card.getAttribute("data-session") || "",
                    upazila: card.getAttribute("data-upazila") || "",
                    phone: card.getAttribute("data-phone") || "",
                    whatsapp: card.getAttribute("data-phone") || ""
                });
            });
            populateMemberFilters();
        }
    }

    function populateMemberFilters() {
        const upazilas = new Set();
        const depts = new Set(typeof MBSTU_DEPARTMENTS !== 'undefined' ? MBSTU_DEPARTMENTS : [
            'CSE', 'ICT', 'TE', 'ME', 'ESRM', 'CPS', 'FTNS', 'BGE', 'BMB',
            'Pharmacy', 'Chemistry', 'Mathematics', 'Physics', 'Statistics',
            'Accounting', 'Management', 'BBA', 'Economics', 'English',
            'Veterinary Science and Animal Husbandry'
        ]);
        const sessions = new Set();

        allMembers.forEach(m => {
            if (m.upazila) upazilas.add(m.upazila);
            if (m.department) depts.add(m.department);
            if (m.session) sessions.add(m.session);
        });

        function updateSelect(selectEl, valuesSet, placeholder) {
            if (!selectEl) return;
            const currentVal = selectEl.value;
            selectEl.innerHTML = `<option value="">${placeholder}</option>`;
            [...valuesSet].sort().forEach(val => {
                selectEl.innerHTML += `<option value="${val}">${val}</option>`;
            });
            selectEl.value = currentVal;
        }

        updateSelect(filterUpazila, upazilas, "All Upazilas");
        updateSelect(filterDepartment, depts, "All Departments");
        updateSelect(filterSession, sessions, "All Sessions");
    }

    function renderMembers() {
        if (!membersGrid) return;

        const query = (memberSearchInput ? memberSearchInput.value : "").toLowerCase().trim();
        const upazilaVal = filterUpazila ? filterUpazila.value : "";
        const deptVal = filterDepartment ? filterDepartment.value : "";
        const sessionVal = filterSession ? filterSession.value : "";

        const isFilterActive = query || upazilaVal || deptVal || sessionVal;
        if (resetFiltersBtn) {
            if (isFilterActive) resetFiltersBtn.classList.remove("hidden");
            else resetFiltersBtn.classList.add("hidden");
        }

        // Filter and sort members (newest session first)
        const filtered = allMembers.filter(m => {
            const matchesSearch = 
                (m.name || "").toLowerCase().includes(query) ||
                (m.department || "").toLowerCase().includes(query) ||
                (m.upazila || "").toLowerCase().includes(query) ||
                (m.session || "").toLowerCase().includes(query);

            const matchesUpazila = !upazilaVal || (m.upazila || "").toLowerCase() === upazilaVal.toLowerCase();
            const matchesDept = !deptVal || (m.department || "").toUpperCase() === deptVal.toUpperCase();
            const matchesSession = !sessionVal || (m.session || "") === sessionVal;

            return matchesSearch && matchesUpazila && matchesDept && matchesSession;
        }).sort((a, b) => (b.session || "").localeCompare(a.session || ""));

        // Update count text
        if (memberCountText) {
            memberCountText.textContent = `Showing ${filtered.length} of ${allMembers.length} members`;
        }

        if (filtered.length === 0) {
            membersGrid.innerHTML = "";
            membersGrid.classList.add("hidden");
            if (noResultsText) noResultsText.classList.remove("hidden");
            if (membersEmptyState) membersEmptyState.classList.remove("hidden");
            return;
        }

        if (noResultsText) noResultsText.classList.add("hidden");
        if (membersEmptyState) membersEmptyState.classList.add("hidden");
        membersGrid.classList.remove("hidden");

        membersGrid.innerHTML = filtered.map(m => {
            const safePhone = m.phone ? m.phone.replace(/[^0-9+]/g, '') : '';
            const safeWhatsApp = m.whatsapp ? m.whatsapp.replace(/[^0-9]/g, '') : safePhone;

            return `
                <div class="member-card glass-card reveal active" data-id="${m._id}" data-name="${m.name}" data-department="${m.department}" data-session="${m.session}" data-upazila="${m.upazila}" data-phone="${m.phone}">
                    <div class="member-accent-bar"></div>
                    ${isAdminLoggedIn ? `
                        <div class="card-admin-action">
                            <button class="btn-card-delete delete-member-btn" data-id="${m._id}" data-name="${m.name}" title="Delete Member">
                                <i data-lucide="trash-2" class="icon-xs"></i>
                                <span>Delete</span>
                            </button>
                        </div>
                    ` : ''}
                    <div class="member-card-body">
                        <div class="member-icon-badge">
                            <i data-lucide="user-check" class="icon-sm"></i>
                        </div>
                        <h3 class="member-name">${m.name}</h3>
                        <p class="member-dept-session-txt">${m.department} • Session ${m.session}</p>
                    </div>
                    <div class="member-card-footer">
                        <div class="upazila-info">
                            <span class="upazila-label">Upazila</span>
                            <span class="upazila-name">${m.upazila}</span>
                        </div>
                        <div class="member-actions">
                            ${safePhone ? `<a href="tel:${safePhone}" class="action-btn call-btn" title="Call Member"><i data-lucide="phone" class="icon-xs"></i></a>` : ''}
                            ${safeWhatsApp ? `<a href="https://wa.me/88${safeWhatsApp}" target="_blank" class="action-btn wa-btn" title="WhatsApp Message"><i data-lucide="message-square" class="icon-xs"></i></a>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join("");

        // Attach Delete Listeners for Member Cards
        document.querySelectorAll(".delete-member-btn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                e.stopPropagation();
                const id = btn.getAttribute("data-id");
                const name = btn.getAttribute("data-name");
                if (confirm(`Are you sure you want to remove ${name} from the member directory?`)) {
                    await deleteMember(id);
                }
            });
        });

        renderIcons();
    }

    async function deleteMember(id) {
        const token = getAuthToken();
        if (!token) return showToast("Admin token required", false);

        try {
            const res = await fetch(`${API_BASE_URL}/members/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                showToast("Member deleted successfully!");
                allMembers = allMembers.filter(m => m._id !== id);
                renderMembers();
            } else {
                showToast(data.error || "Failed to delete member", false);
            }
        } catch (err) {
            showToast("Server error while deleting member", false);
        }
    }

    function resetMemberFilters() {
        if (memberSearchInput) memberSearchInput.value = "";
        if (filterUpazila) filterUpazila.value = "";
        if (filterDepartment) filterDepartment.value = "";
        if (filterSession) filterSession.value = "";
        renderMembers();
    }

    if (memberSearchInput) memberSearchInput.addEventListener("input", renderMembers);
    if (filterUpazila) filterUpazila.addEventListener("change", renderMembers);
    if (filterDepartment) filterDepartment.addEventListener("change", renderMembers);
    if (filterSession) filterSession.addEventListener("change", renderMembers);
    if (resetFiltersBtn) resetFiltersBtn.addEventListener("click", resetMemberFilters);
    if (emptyStateResetBtn) emptyStateResetBtn.addEventListener("click", resetMemberFilters);


    // ==================== 5. MEMBER MODAL (ADD NEW) ====================
    const openAddMemberBtn = document.getElementById("openAddMemberBtn");
    const memberModal = document.getElementById("memberModal");
    const memberModalCloseBtn = document.getElementById("memberModalCloseBtn");
    const memberModalBackdropClose = document.getElementById("memberModalBackdropClose");
    const memberForm = document.getElementById("memberForm");
    const memberModalAlert = document.getElementById("memberModalAlert");

    function openMemberModal() {
        if (memberModal) {
            memberModal.classList.remove("hidden");
            if (memberModalAlert) memberModalAlert.classList.add("hidden");
            if (memberForm) memberForm.reset();
            body.style.overflow = "hidden";
        }
    }

    function closeMemberModal() {
        if (memberModal) {
            memberModal.classList.add("hidden");
            body.style.overflow = "";
        }
    }

    if (openAddMemberBtn) openAddMemberBtn.addEventListener("click", openMemberModal);
    if (memberModalCloseBtn) memberModalCloseBtn.addEventListener("click", closeMemberModal);
    if (memberModalBackdropClose) memberModalBackdropClose.addEventListener("click", closeMemberModal);

    if (memberForm) {
        memberForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const token = getAuthToken();
            if (!token) return showToast("Admin token required", false);

            const payload = {
                name: document.getElementById("memberFormName").value.trim(),
                department: document.getElementById("memberFormDept").value.trim(),
                session: document.getElementById("memberFormSession").value.trim(),
                upazila: document.getElementById("memberFormUpazila").value,
                phone: document.getElementById("memberFormPhone").value.trim(),
                whatsapp: document.getElementById("memberFormWhatsApp").value.trim()
            };

            try {
                const res = await fetch(`${API_BASE_URL}/members`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success && data.data) {
                    allMembers.unshift(data.data);
                    populateMemberFilters();
                    renderMembers();
                    closeMemberModal();
                    showToast("Member added successfully!");
                } else {
                    if (memberModalAlert) {
                        memberModalAlert.textContent = data.error || "Failed to add member.";
                        memberModalAlert.classList.remove("hidden");
                    }
                }
            } catch (err) {
                if (memberModalAlert) {
                    memberModalAlert.textContent = "Error communicating with server.";
                    memberModalAlert.classList.remove("hidden");
                }
            }
        });
    }


    // ==================== 6. EVENTS TAB & API INTEGRATION ====================
    let allEvents = [];
    let currentEventStatus = "Upcoming";

    const tabBtnUpcoming = document.getElementById("tabBtnUpcoming");
    const tabBtnCompleted = document.getElementById("tabBtnCompleted");
    const eventsGrid = document.getElementById("eventsGrid");
    const eventsEmptyState = document.getElementById("eventsEmptyState");

    async function fetchEvents() {
        try {
            const res = await fetch(`${API_BASE_URL}/events`);
            const result = await res.json();
            if (result.success && Array.isArray(result.data)) {
                allEvents = result.data;
                renderEvents();
            }
        } catch (err) {
            console.error("Failed to fetch events from API:", err);
            parseFallbackEvents();
        }
    }

    function parseFallbackEvents() {
        const domCards = eventsGrid ? eventsGrid.querySelectorAll(".event-card") : [];
        if (domCards.length > 0 && allEvents.length === 0) {
            domCards.forEach(card => {
                allEvents.push({
                    _id: card.getAttribute("data-id") || Math.random().toString(),
                    title: card.querySelector(".event-card-title")?.textContent.trim() || "",
                    type: card.getAttribute("data-event-status") || "Upcoming",
                    date: card.querySelector(".ef-val span:last-child")?.textContent.trim() || "",
                    location: card.querySelectorAll(".ef-val")[1]?.textContent.trim() || "",
                    description: card.querySelector(".event-description")?.textContent.trim() || ""
                });
            });
            renderEvents();
        }
    }

    function renderEvents() {
        if (!eventsGrid) return;

        const filtered = allEvents.filter(ev => 
            (ev.type || "Upcoming").toLowerCase() === currentEventStatus.toLowerCase()
        );

        if (filtered.length === 0) {
            eventsGrid.innerHTML = "";
            eventsGrid.classList.add("hidden");
            if (eventsEmptyState) eventsEmptyState.classList.remove("hidden");
            return;
        }

        if (eventsEmptyState) eventsEmptyState.classList.add("hidden");
        eventsGrid.classList.remove("hidden");

        eventsGrid.innerHTML = filtered.map(ev => {
            const isUpcoming = (ev.type || "").toLowerCase() === "upcoming";
            return `
                <div class="event-card glass-card reveal active" data-id="${ev._id}" data-event-status="${ev.type}">
                    ${isAdminLoggedIn ? `
                        <div class="card-admin-action">
                            <button class="btn-card-delete delete-event-btn" data-id="${ev._id}" data-title="${ev.title}" title="Delete Event">
                                <i data-lucide="trash-2" class="icon-xs"></i>
                                <span>Delete</span>
                            </button>
                        </div>
                    ` : ''}
                    <div class="event-banner">
                        <i data-lucide="calendar" class="banner-icon-bg"></i>
                        <div class="banner-overlay">
                            <span class="status-tag ${isUpcoming ? 'status-upcoming' : 'status-completed'}">
                                <i data-lucide="${isUpcoming ? 'clock' : 'check-circle'}" class="icon-xs"></i>
                                <span>${ev.type}</span>
                            </span>
                            <h3 class="event-card-title">${ev.title}</h3>
                        </div>
                    </div>
                    <div class="event-card-body">
                        <p class="event-description">${ev.description}</p>
                    </div>
                    <div class="event-card-footer">
                        <div class="event-footer-col">
                            <span class="ef-label">Event Date</span>
                            <span class="ef-val">
                                <i data-lucide="calendar" class="icon-xs text-sky"></i>
                                <span>${ev.date}</span>
                            </span>
                        </div>
                        <div class="event-footer-col">
                            <span class="ef-label">Venue Location</span>
                            <span class="ef-val" title="${ev.location}">
                                <i data-lucide="map-pin" class="icon-xs text-amber"></i>
                                <span class="truncate">${ev.location}</span>
                            </span>
                        </div>
                    </div>
                </div>
            `;
        }).join("");

        // Attach Delete Listeners for Event Cards
        document.querySelectorAll(".delete-event-btn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                e.stopPropagation();
                const id = btn.getAttribute("data-id");
                const title = btn.getAttribute("data-title");
                if (confirm(`Are you sure you want to delete event "${title}"?`)) {
                    await deleteEvent(id);
                }
            });
        });

        renderIcons();
    }

    async function deleteEvent(id) {
        const token = getAuthToken();
        if (!token) return showToast("Admin token required", false);

        try {
            const res = await fetch(`${API_BASE_URL}/events/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                showToast("Event deleted successfully!");
                allEvents = allEvents.filter(ev => ev._id !== id);
                renderEvents();
            } else {
                showToast(data.error || "Failed to delete event", false);
            }
        } catch (err) {
            showToast("Server error while deleting event", false);
        }
    }

    if (tabBtnUpcoming && tabBtnCompleted) {
        tabBtnUpcoming.addEventListener("click", () => {
            tabBtnUpcoming.classList.add("active");
            tabBtnCompleted.classList.remove("active");
            currentEventStatus = "Upcoming";
            renderEvents();
        });

        tabBtnCompleted.addEventListener("click", () => {
            tabBtnCompleted.classList.add("active");
            tabBtnUpcoming.classList.remove("active");
            currentEventStatus = "Completed";
            renderEvents();
        });
    }

    // Event Modal
    const openAddEventBtn = document.getElementById("openAddEventBtn");
    const eventModal = document.getElementById("eventModal");
    const eventModalCloseBtn = document.getElementById("eventModalCloseBtn");
    const eventModalBackdropClose = document.getElementById("eventModalBackdropClose");
    const eventForm = document.getElementById("eventForm");
    const eventModalAlert = document.getElementById("eventModalAlert");

    function openEventModal() {
        if (eventModal) {
            eventModal.classList.remove("hidden");
            if (eventModalAlert) eventModalAlert.classList.add("hidden");
            if (eventForm) eventForm.reset();
            body.style.overflow = "hidden";
        }
    }

    function closeEventModal() {
        if (eventModal) {
            eventModal.classList.add("hidden");
            body.style.overflow = "";
        }
    }

    if (openAddEventBtn) openAddEventBtn.addEventListener("click", openEventModal);
    if (eventModalCloseBtn) eventModalCloseBtn.addEventListener("click", closeEventModal);
    if (eventModalBackdropClose) eventModalBackdropClose.addEventListener("click", closeEventModal);

    if (eventForm) {
        eventForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const token = getAuthToken();
            if (!token) return showToast("Admin token required", false);

            const payload = {
                title: document.getElementById("eventFormTitle").value.trim(),
                type: document.getElementById("eventFormType").value,
                date: document.getElementById("eventFormDate").value,
                location: document.getElementById("eventFormLocation").value.trim(),
                description: document.getElementById("eventFormDesc").value.trim()
            };

            try {
                const res = await fetch(`${API_BASE_URL}/events`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success && data.data) {
                    allEvents.unshift(data.data);
                    renderEvents();
                    closeEventModal();
                    showToast("Event created successfully!");
                } else {
                    if (eventModalAlert) {
                        eventModalAlert.textContent = data.error || "Failed to create event.";
                        eventModalAlert.classList.remove("hidden");
                    }
                }
            } catch (err) {
                if (eventModalAlert) {
                    eventModalAlert.textContent = "Server error while saving event.";
                    eventModalAlert.classList.remove("hidden");
                }
            }
        });
    }


    // ==================== 7. NOTICES & NEWS API INTEGRATION ====================
    let allNotices = [];
    let activeNewsCategory = "ALL";

    const newsSearchInput = document.getElementById("newsSearchInput");
    const newsGrid = document.getElementById("newsGrid");
    const newsEmptyState = document.getElementById("newsEmptyState");
    const newsCategoryBtns = document.querySelectorAll("[data-news-category]");
    const tickerNoticeText = document.getElementById("tickerNoticeText");

    // Details Modal elements
    const newsDetailsModal = document.getElementById("newsDetailsModal");
    const newsModalCloseBtn = document.getElementById("newsModalCloseBtn");
    const newsModalBackdropClose = document.getElementById("newsModalBackdropClose");
    const modalTypeTag = document.getElementById("modalTypeTag");
    const modalTitle = document.getElementById("modalTitle");
    const modalDate = document.getElementById("modalDate");
    const modalContent = document.getElementById("modalContent");
    const modalCloseActionBtn = document.getElementById("modalCloseActionBtn");

    async function fetchNotices() {
        try {
            const res = await fetch(`${API_BASE_URL}/notices`);
            const result = await res.json();
            if (result.success && Array.isArray(result.data)) {
                allNotices = result.data;
                renderNotices();
                updateTickerNotice();
            }
        } catch (err) {
            console.error("Failed to fetch notices from API:", err);
            parseFallbackNotices();
        }
    }

    function parseFallbackNotices() {
        const domCards = newsGrid ? newsGrid.querySelectorAll(".news-card") : [];
        if (domCards.length > 0 && allNotices.length === 0) {
            domCards.forEach(card => {
                allNotices.push({
                    _id: card.getAttribute("data-id") || Math.random().toString(),
                    title: card.querySelector(".news-title")?.textContent.trim() || "",
                    category: card.getAttribute("data-news-type") || "NOTICE",
                    date: card.getAttribute("data-date") || "",
                    content: card.querySelector(".news-snippet")?.textContent.trim() || ""
                });
            });
            renderNotices();
            updateTickerNotice();
        }
    }

    function updateTickerNotice() {
        if (tickerNoticeText && allNotices.length > 0) {
            const latestNotice = allNotices.find(n => n.category === "NOTICE") || allNotices[0];
            if (latestNotice) {
                tickerNoticeText.textContent = `${latestNotice.title} — ${latestNotice.content}`;
            }
        }
    }

    function renderNotices() {
        if (!newsGrid) return;

        const query = (newsSearchInput ? newsSearchInput.value : "").toLowerCase().trim();

        const filtered = allNotices.filter(item => {
            const cat = (item.category || "NOTICE").toUpperCase();
            const matchesCategory = activeNewsCategory === "ALL" || cat === activeNewsCategory;
            const matchesSearch = 
                (item.title || "").toLowerCase().includes(query) ||
                (item.content || "").toLowerCase().includes(query);
            return matchesCategory && matchesSearch;
        });

        if (filtered.length === 0) {
            newsGrid.innerHTML = "";
            newsGrid.classList.add("hidden");
            if (newsEmptyState) newsEmptyState.classList.remove("hidden");
            return;
        }

        if (newsEmptyState) newsEmptyState.classList.add("hidden");
        newsGrid.classList.remove("hidden");

        newsGrid.innerHTML = filtered.map(item => {
            const isNotice = (item.category || "NOTICE").toUpperCase() === "NOTICE";
            return `
                <div class="news-card glass-card reveal active" data-id="${item._id}" data-news-type="${item.category}" data-date="${item.date}">
                    ${isAdminLoggedIn ? `
                        <div class="card-admin-action">
                            <button class="btn-card-delete delete-notice-btn" data-id="${item._id}" data-title="${item.title}" title="Delete Announcement">
                                <i data-lucide="trash-2" class="icon-xs"></i>
                                <span>Delete</span>
                            </button>
                        </div>
                    ` : ''}
                    <div class="news-card-inner">
                        <div class="news-card-header">
                            <div class="news-badge ${isNotice ? 'badge-notice' : 'badge-news'}">
                                <i data-lucide="${isNotice ? 'bell' : 'newspaper'}" class="icon-xs"></i>
                            </div>
                            <span class="news-publish-date">${item.date}</span>
                        </div>
                        <div class="news-card-content">
                            <h3 class="news-title">${item.title}</h3>
                            <p class="news-snippet">${item.content}</p>
                        </div>
                    </div>
                    <div class="news-card-footer">
                        <span class="news-footer-tag">
                            <i data-lucide="calendar" class="icon-xs"></i>
                            <span>${item.category}</span>
                        </span>
                        <button class="read-details-btn" data-id="${item._id}">
                            <span>Read Details</span>
                            <i data-lucide="arrow-right" class="icon-xs"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join("");

        // Attach Read Details listeners
        document.querySelectorAll(".read-details-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id");
                const item = allNotices.find(n => n._id === id);
                if (item) openNewsDetailsModal(item);
            });
        });

        // Attach Delete listeners
        document.querySelectorAll(".delete-notice-btn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                e.stopPropagation();
                const id = btn.getAttribute("data-id");
                const title = btn.getAttribute("data-title");
                if (confirm(`Are you sure you want to delete notice "${title}"?`)) {
                    await deleteNotice(id);
                }
            });
        });

        renderIcons();
    }

    async function deleteNotice(id) {
        const token = getAuthToken();
        if (!token) return showToast("Admin token required", false);

        try {
            const res = await fetch(`${API_BASE_URL}/notices/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                showToast("Announcement deleted successfully!");
                allNotices = allNotices.filter(n => n._id !== id);
                renderNotices();
                updateTickerNotice();
            } else {
                showToast(data.error || "Failed to delete notice", false);
            }
        } catch (err) {
            showToast("Server error while deleting notice", false);
        }
    }

    function openNewsDetailsModal(item) {
        if (!newsDetailsModal) return;
        const isNotice = (item.category || "NOTICE").toUpperCase() === "NOTICE";
        modalTypeTag.textContent = item.category;
        modalTypeTag.className = `modal-type-tag ${isNotice ? 'badge-notice' : 'badge-news'}`;
        modalTitle.textContent = item.title;
        modalDate.textContent = `Published on: ${item.date}`;
        modalContent.textContent = item.content;

        newsDetailsModal.classList.remove("hidden");
        body.style.overflow = "hidden";
    }

    function closeNewsDetailsModal() {
        if (newsDetailsModal) {
            newsDetailsModal.classList.add("hidden");
            body.style.overflow = "";
        }
    }

    if (newsModalCloseBtn) newsModalCloseBtn.addEventListener("click", closeNewsDetailsModal);
    if (newsModalBackdropClose) newsModalBackdropClose.addEventListener("click", closeNewsDetailsModal);
    if (modalCloseActionBtn) modalCloseActionBtn.addEventListener("click", closeNewsDetailsModal);

    newsCategoryBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            newsCategoryBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            activeNewsCategory = btn.getAttribute("data-news-category");
            renderNotices();
        });
    });

    if (newsSearchInput) newsSearchInput.addEventListener("input", renderNotices);

    // Notice Modal
    const openAddNoticeBtn = document.getElementById("openAddNoticeBtn");
    const noticeModal = document.getElementById("noticeModal");
    const noticeModalCloseBtn = document.getElementById("noticeModalCloseBtn");
    const noticeModalBackdropClose = document.getElementById("noticeModalBackdropClose");
    const noticeForm = document.getElementById("noticeForm");
    const noticeModalAlert = document.getElementById("noticeModalAlert");

    function openNoticeModal() {
        if (noticeModal) {
            noticeModal.classList.remove("hidden");
            if (noticeModalAlert) noticeModalAlert.classList.add("hidden");
            if (noticeForm) {
                noticeForm.reset();
                const dateInput = document.getElementById("noticeFormDate");
                if (dateInput) dateInput.value = new Date().toISOString().split("T")[0];
            }
            body.style.overflow = "hidden";
        }
    }

    function closeNoticeModal() {
        if (noticeModal) {
            noticeModal.classList.add("hidden");
            body.style.overflow = "";
        }
    }

    if (openAddNoticeBtn) openAddNoticeBtn.addEventListener("click", openNoticeModal);
    if (noticeModalCloseBtn) noticeModalCloseBtn.addEventListener("click", closeNoticeModal);
    if (noticeModalBackdropClose) noticeModalBackdropClose.addEventListener("click", closeNoticeModal);

    if (noticeForm) {
        noticeForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const token = getAuthToken();
            if (!token) return showToast("Admin token required", false);

            const payload = {
                title: document.getElementById("noticeFormTitle").value.trim(),
                category: document.getElementById("noticeFormCategory").value,
                date: document.getElementById("noticeFormDate").value,
                content: document.getElementById("noticeFormContent").value.trim()
            };

            try {
                const res = await fetch(`${API_BASE_URL}/notices`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success && data.data) {
                    allNotices.unshift(data.data);
                    renderNotices();
                    updateTickerNotice();
                    closeNoticeModal();
                    showToast("Notice published successfully!");
                } else {
                    if (noticeModalAlert) {
                        noticeModalAlert.textContent = data.error || "Failed to publish notice.";
                        noticeModalAlert.classList.remove("hidden");
                    }
                }
            } catch (err) {
                if (noticeModalAlert) {
                    noticeModalAlert.textContent = "Server error while publishing notice.";
                    noticeModalAlert.classList.remove("hidden");
                }
            }
        });
    }


    // ==================== 8. PHOTO GALLERY LIGHTBOX ====================
    const galleryItems = document.querySelectorAll(".gallery-item-card");
    const lightboxModal = document.getElementById("lightboxModal");
    const lightboxCloseBtn = document.getElementById("lightboxCloseBtn");
    const lightboxOverlayClose = document.getElementById("lightboxOverlayClose");
    const lightboxPrevBtn = document.getElementById("lightboxPrevBtn");
    const lightboxNextBtn = document.getElementById("lightboxNextBtn");
    const lightboxTitle = document.getElementById("lightboxTitle");
    const lightboxMetaText = document.getElementById("lightboxMetaText");
    const lightboxImg = document.getElementById("lightboxImg");
    let currentGalleryIndex = null;

    function openLightbox(index) {
        currentGalleryIndex = index;
        if (lightboxModal) lightboxModal.classList.remove("hidden");
        body.style.overflow = "hidden";
        updateLightboxContent();
    }

    function closeLightbox() {
        if (lightboxModal) lightboxModal.classList.add("hidden");
        body.style.overflow = "";
        currentGalleryIndex = null;
    }

    function updateLightboxContent() {
        if (currentGalleryIndex === null || !galleryItems[currentGalleryIndex]) return;
        const currentItem = galleryItems[currentGalleryIndex];
        const title = currentItem.getAttribute("data-title");
        const date = currentItem.getAttribute("data-date");
        const img = currentItem.querySelector("img");

        if (img && lightboxImg) {
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt || title;
        }
        if (lightboxTitle) lightboxTitle.textContent = title;
        if (lightboxMetaText) {
            lightboxMetaText.textContent = `Uploaded: ${date} • Photo ${currentGalleryIndex + 1} of ${galleryItems.length}`;
        }
    }

    function navigateGallery(direction) {
        if (currentGalleryIndex === null) return;
        if (direction === "next") {
            currentGalleryIndex = (currentGalleryIndex === galleryItems.length - 1) ? 0 : currentGalleryIndex + 1;
        } else {
            currentGalleryIndex = (currentGalleryIndex === 0) ? galleryItems.length - 1 : currentGalleryIndex - 1;
        }
        updateLightboxContent();
    }

    galleryItems.forEach((item) => {
        item.addEventListener("click", () => {
            const index = parseInt(item.getAttribute("data-gallery-index"));
            openLightbox(index);
        });
    });

    if (lightboxCloseBtn) lightboxCloseBtn.addEventListener("click", closeLightbox);
    if (lightboxOverlayClose) lightboxOverlayClose.addEventListener("click", closeLightbox);
    if (lightboxPrevBtn) lightboxPrevBtn.addEventListener("click", () => navigateGallery("prev"));
    if (lightboxNextBtn) lightboxNextBtn.addEventListener("click", () => navigateGallery("next"));

    window.addEventListener("keydown", (e) => {
        if (lightboxModal && !lightboxModal.classList.contains("hidden")) {
            if (e.key === "ArrowRight") navigateGallery("next");
            else if (e.key === "ArrowLeft") navigateGallery("prev");
            else if (e.key === "Escape") closeLightbox();
        }
    });


    // ==================== 9. CLIPBOARD COPY BUTTONS ====================
    const copyBtns = document.querySelectorAll(".copy-btn");
    copyBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const textToCopy = btn.getAttribute("data-copy-text");
            const label = btn.getAttribute("data-copy-label");

            if (navigator.clipboard && textToCopy) {
                navigator.clipboard.writeText(textToCopy)
                    .then(() => showToast(`Copied ${label} to clipboard!`))
                    .catch(err => console.error("Clipboard copy failed:", err));
            }
        });
    });


    // ==================== INITIAL DATA INITIALIZATION ====================
    verifyAdminAuth();
    fetchMembers();
    fetchEvents();
    fetchNotices();
});