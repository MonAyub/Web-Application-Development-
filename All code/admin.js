/**
 * Narsingdi District Student Council, MBSTU
 * Admin Control Panel Logic (admin.js)
 */

const API_BASE_URL = 'http://127.0.0.1:5000/api';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Guard page for Admin privileges only
    if (!Auth.guardPage(true)) return;

    // 2. Render Navbar
    Auth.renderNavbar('admin');

    const token = Auth.getToken();
    const adminUser = Auth.getUser();

    // Admin Info
    const adminDisplayName = document.getElementById('adminDisplayName');
    if (adminDisplayName && adminUser) {
        adminDisplayName.textContent = adminUser.name || adminUser.username || 'Admin';
    }

    const adminLogoutBtn = document.getElementById('adminPageLogoutBtn');
    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', () => Auth.logout());
    }

    // Tab Navigation
    const tabBtns = document.querySelectorAll('.admin-tab-btn');
    const tabPanes = document.querySelectorAll('.admin-tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetPane = document.getElementById(targetTab);
            if (targetPane) targetPane.classList.add('active');
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    });

    // Toast helper
    const toast = document.getElementById('copyToast');
    const toastText = document.getElementById('toastText');
    function showToast(message, isSuccess = true) {
        if (!toast || !toastText) return;
        toastText.textContent = message;
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 3500);
    }

    // State data
    let adminMembers = [];
    let adminNotices = [];
    let adminEvents = [];
    let adminUsers = [];

    // ==================== 1. FETCH ALL STATS & DATA ====================
    async function loadAllData() {
        await Promise.all([
            loadMembers(),
            loadNotices(),
            loadEvents(),
            loadUsers()
        ]);
        updateStats();
    }

    function updateStats() {
        const countMembersEl = document.getElementById('statTotalMembers');
        const countNoticesEl = document.getElementById('statTotalNotices');
        const countEventsEl = document.getElementById('statTotalEvents');
        const countUsersEl = document.getElementById('statTotalUsers');

        if (countMembersEl) countMembersEl.textContent = adminMembers.length;
        if (countNoticesEl) countNoticesEl.textContent = adminNotices.length;
        if (countEventsEl) countEventsEl.textContent = adminEvents.length;
        if (countUsersEl) countUsersEl.textContent = adminUsers.length;
    }

    // ==================== 2. MEMBERS MANAGEMENT ====================
    async function loadMembers() {
        try {
            const res = await fetch('http://127.0.0.1:5000/api/members');
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                adminMembers = data.data;
                renderAdminMembers();
            }
        } catch (e) {
            console.error('Error fetching members for admin:', e);
        }
    }

    function renderAdminMembers() {
        const tbody = document.getElementById('adminMembersTableBody');
        const searchInput = document.getElementById('adminMemberSearch');
        if (!tbody) return;

        const q = (searchInput ? searchInput.value : '').toLowerCase().trim();
        const filtered = adminMembers.filter(m =>
            (m.name || '').toLowerCase().includes(q) ||
            (m.department || '').toLowerCase().includes(q) ||
            (m.upazila || '').toLowerCase().includes(q) ||
            (m.session || '').toLowerCase().includes(q) ||
            (m.phone || '').includes(q)
        );

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding: 24px;">No members found.</td></tr>`;
            return;
        }

        tbody.innerHTML = filtered.map((m, idx) => `
            <tr>
                <td style="font-weight: 600; color: var(--color-sky);">${idx + 1}</td>
                <td style="font-weight: 700; color: #fff;">${m.name}</td>
                <td>${m.department}</td>
                <td><span class="badge-small bg-sky-light text-sky">${m.session}</span></td>
                <td>${m.upazila}</td>
                <td>${m.phone}</td>
                <td>
                    <button class="btn-card-delete delete-admin-member" data-id="${m._id}" data-name="${m.name}" title="Delete">
                        <i data-lucide="trash-2" class="icon-xs"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');

        tbody.querySelectorAll('.delete-admin-member').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                const name = btn.getAttribute('data-name');
                if (confirm(`Remove member "${name}" from directory?`)) {
                    await deleteMember(id);
                }
            });
        });

        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    async function deleteMember(id) {
        try {
            const res = await fetch(`http://127.0.0.1:5000/api/members/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                showToast('Member deleted successfully.');
                adminMembers = adminMembers.filter(m => m._id !== id);
                renderAdminMembers();
                updateStats();
            } else {
                showToast(data.error || 'Failed to delete member.', false);
            }
        } catch (err) {
            showToast('Server error while deleting.', false);
        }
    }

    const adminMemberSearch = document.getElementById('adminMemberSearch');
    if (adminMemberSearch) adminMemberSearch.addEventListener('input', renderAdminMembers);

    // ==================== 3. NOTICES MANAGEMENT ====================
    async function loadNotices() {
        try {
            const res = await fetch('http://127.0.0.1:5000/api/notices');
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                adminNotices = data.data;
                renderAdminNotices();
            }
        } catch (e) {
            console.error('Error fetching notices for admin:', e);
        }
    }

    function renderAdminNotices() {
        const tbody = document.getElementById('adminNoticesTableBody');
        const searchInput = document.getElementById('adminNoticeSearch');
        if (!tbody) return;

        const q = (searchInput ? searchInput.value : '').toLowerCase().trim();
        const filtered = adminNotices.filter(n =>
            (n.title || '').toLowerCase().includes(q) ||
            (n.content || '').toLowerCase().includes(q) ||
            (n.category || '').toLowerCase().includes(q)
        );

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted" style="padding: 24px;">No notices found.</td></tr>`;
            return;
        }

        tbody.innerHTML = filtered.map((n, idx) => `
            <tr>
                <td style="font-weight: 600; color: var(--color-sky);">${idx + 1}</td>
                <td><span class="badge-small ${n.category === 'NOTICE' ? 'bg-sky-light text-sky' : 'bg-amber text-amber'}">${n.category}</span></td>
                <td style="font-weight: 700; color: #fff;">${n.title}</td>
                <td>${n.date}</td>
                <td>
                    <button class="btn-card-delete delete-admin-notice" data-id="${n._id}" data-title="${n.title}" title="Delete">
                        <i data-lucide="trash-2" class="icon-xs"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');

        tbody.querySelectorAll('.delete-admin-notice').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                const title = btn.getAttribute('data-title');
                if (confirm(`Delete announcement "${title}"?`)) {
                    await deleteNotice(id);
                }
            });
        });

        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    async function deleteNotice(id) {
        try {
            const res = await fetch(`http://127.0.0.1:5000/api/notices/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                showToast('Notice deleted successfully.');
                adminNotices = adminNotices.filter(n => n._id !== id);
                renderAdminNotices();
                updateStats();
            } else {
                showToast(data.error || 'Failed to delete notice.', false);
            }
        } catch (err) {
            showToast('Server error while deleting.', false);
        }
    }

    const adminNoticeSearch = document.getElementById('adminNoticeSearch');
    if (adminNoticeSearch) adminNoticeSearch.addEventListener('input', renderAdminNotices);

    // ==================== 4. EVENTS MANAGEMENT ====================
    async function loadEvents() {
        try {
            const res = await fetch('http://127.0.0.1:5000/api/events');
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                adminEvents = data.data;
                renderAdminEvents();
            }
        } catch (e) {
            console.error('Error fetching events for admin:', e);
        }
    }

    function renderAdminEvents() {
        const tbody = document.getElementById('adminEventsTableBody');
        const searchInput = document.getElementById('adminEventSearch');
        if (!tbody) return;

        const q = (searchInput ? searchInput.value : '').toLowerCase().trim();
        const filtered = adminEvents.filter(ev =>
            (ev.title || '').toLowerCase().includes(q) ||
            (ev.location || '').toLowerCase().includes(q) ||
            (ev.type || '').toLowerCase().includes(q)
        );

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted" style="padding: 24px;">No events found.</td></tr>`;
            return;
        }

        tbody.innerHTML = filtered.map((ev, idx) => `
            <tr>
                <td style="font-weight: 600; color: var(--color-sky);">${idx + 1}</td>
                <td><span class="status-tag ${ev.type === 'Upcoming' ? 'status-upcoming' : 'status-completed'}">${ev.type}</span></td>
                <td style="font-weight: 700; color: #fff;">${ev.title}</td>
                <td>${ev.date}</td>
                <td>${ev.location}</td>
                <td>
                    <button class="btn-card-delete delete-admin-event" data-id="${ev._id}" data-title="${ev.title}" title="Delete">
                        <i data-lucide="trash-2" class="icon-xs"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');

        tbody.querySelectorAll('.delete-admin-event').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                const title = btn.getAttribute('data-title');
                if (confirm(`Delete event "${title}"?`)) {
                    await deleteEvent(id);
                }
            });
        });

        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    async function deleteEvent(id) {
        try {
            const res = await fetch(`http://127.0.0.1:5000/api/events/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                showToast('Event deleted successfully.');
                adminEvents = adminEvents.filter(ev => ev._id !== id);
                renderAdminEvents();
                updateStats();
            } else {
                showToast(data.error || 'Failed to delete event.', false);
            }
        } catch (err) {
            showToast('Server error while deleting.', false);
        }
    }

    const adminEventSearch = document.getElementById('adminEventSearch');
    if (adminEventSearch) adminEventSearch.addEventListener('input', renderAdminEvents);

    // ==================== 5. REGISTERED USERS MANAGEMENT ====================
    async function loadUsers() {
        try {
            const res = await fetch('http://127.0.0.1:5000/api/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                adminUsers = data.data;
                renderAdminUsers();
            }
        } catch (e) {
            console.error('Error fetching registered users:', e);
        }
    }

    function renderAdminUsers() {
        const tbody = document.getElementById('adminUsersTableBody');
        const searchInput = document.getElementById('adminUserSearch');
        if (!tbody) return;

        const q = (searchInput ? searchInput.value : '').toLowerCase().trim();
        const filtered = adminUsers.filter(u =>
            (u.name || '').toLowerCase().includes(q) ||
            (u.email || '').toLowerCase().includes(q) ||
            (u.department || '').toLowerCase().includes(q) ||
            (u.upazila || '').toLowerCase().includes(q) ||
            (u.phone || '').includes(q)
        );

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding: 24px;">No registered users found.</td></tr>`;
            return;
        }

        tbody.innerHTML = filtered.map((u, idx) => {
            const isUserAdmin = u.role === 'admin' || u.role === 'superadmin';
            const joined = u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-';

            return `
                <tr>
                    <td style="font-weight: 600; color: var(--color-sky);">${idx + 1}</td>
                    <td style="font-weight: 700; color: #fff;">${u.name || u.username || 'User'}</td>
                    <td>${u.email || '-'}</td>
                    <td>${u.department || '-'} • ${u.session || '-'}</td>
                    <td>${u.upazila || '-'}</td>
                    <td>${u.phone || '-'}</td>
                    <td>
                        <span class="${isUserAdmin ? 'badge-role-admin' : 'badge-role-user'}">
                            ${isUserAdmin ? 'Admin' : 'Member'}
                        </span>
                    </td>
                </tr>
            `;
        }).join('');

        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    const adminUserSearch = document.getElementById('adminUserSearch');
    if (adminUserSearch) adminUserSearch.addEventListener('input', renderAdminUsers);

    // ==================== MODALS IN ADMIN PANEL ====================
    // Member Modal
    const adminAddMemberBtn = document.getElementById('adminAddMemberBtn');
    const memberModal = document.getElementById('memberModal');
    const memberModalCloseBtn = document.getElementById('memberModalCloseBtn');
    const memberModalBackdropClose = document.getElementById('memberModalBackdropClose');
    const memberForm = document.getElementById('memberForm');
    const memberModalAlert = document.getElementById('memberModalAlert');

    if (adminAddMemberBtn) {
        adminAddMemberBtn.addEventListener('click', () => {
            if (memberModal) {
                memberModal.classList.remove('hidden');
                if (memberModalAlert) memberModalAlert.classList.add('hidden');
                if (memberForm) memberForm.reset();
                document.body.style.overflow = 'hidden';
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        });
    }

    if (memberModalCloseBtn) {
        memberModalCloseBtn.addEventListener('click', () => {
            if (memberModal) {
                memberModal.classList.add('hidden');
                document.body.style.overflow = '';
            }
        });
    }

    if (memberModalBackdropClose) {
        memberModalBackdropClose.addEventListener('click', () => {
            if (memberModal) {
                memberModal.classList.add('hidden');
                document.body.style.overflow = '';
            }
        });
    }

    if (memberForm) {
        memberForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                name: document.getElementById('memberFormName').value.trim(),
                department: document.getElementById('memberFormDept').value.trim(),
                session: document.getElementById('memberFormSession').value.trim(),
                upazila: document.getElementById('memberFormUpazila').value,
                phone: document.getElementById('memberFormPhone').value.trim(),
                whatsapp: document.getElementById('memberFormWhatsApp').value.trim()
            };

            try {
                const res = await fetch('http://127.0.0.1:5000/api/members', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success && data.data) {
                    adminMembers.unshift(data.data);
                    renderAdminMembers();
                    updateStats();
                    if (memberModal) memberModal.classList.add('hidden');
                    document.body.style.overflow = '';
                    showToast('Member added successfully!');
                } else {
                    if (memberModalAlert) {
                        memberModalAlert.textContent = data.error || 'Failed to add member.';
                        memberModalAlert.classList.remove('hidden');
                    }
                }
            } catch (err) {
                if (memberModalAlert) {
                    memberModalAlert.textContent = 'Server error while saving member.';
                    memberModalAlert.classList.remove('hidden');
                }
            }
        });
    }

    // Notice Modal
    const adminAddNoticeBtn = document.getElementById('adminAddNoticeBtn');
    const noticeModal = document.getElementById('noticeModal');
    const noticeModalCloseBtn = document.getElementById('noticeModalCloseBtn');
    const noticeModalBackdropClose = document.getElementById('noticeModalBackdropClose');
    const noticeForm = document.getElementById('noticeForm');
    const noticeModalAlert = document.getElementById('noticeModalAlert');

    if (adminAddNoticeBtn) {
        adminAddNoticeBtn.addEventListener('click', () => {
            if (noticeModal) {
                noticeModal.classList.remove('hidden');
                if (noticeModalAlert) noticeModalAlert.classList.add('hidden');
                if (noticeForm) {
                    noticeForm.reset();
                    const d = document.getElementById('noticeFormDate');
                    if (d) d.value = new Date().toISOString().split('T')[0];
                }
                document.body.style.overflow = 'hidden';
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        });
    }

    if (noticeModalCloseBtn) {
        noticeModalCloseBtn.addEventListener('click', () => {
            if (noticeModal) {
                noticeModal.classList.add('hidden');
                document.body.style.overflow = '';
            }
        });
    }

    if (noticeModalBackdropClose) {
        noticeModalBackdropClose.addEventListener('click', () => {
            if (noticeModal) {
                noticeModal.classList.add('hidden');
                document.body.style.overflow = '';
            }
        });
    }

    if (noticeForm) {
        noticeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                title: document.getElementById('noticeFormTitle').value.trim(),
                category: document.getElementById('noticeFormCategory').value,
                date: document.getElementById('noticeFormDate').value,
                content: document.getElementById('noticeFormContent').value.trim()
            };

            try {
                const res = await fetch('http://127.0.0.1:5000/api/notices', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success && data.data) {
                    adminNotices.unshift(data.data);
                    renderAdminNotices();
                    updateStats();
                    if (noticeModal) noticeModal.classList.add('hidden');
                    document.body.style.overflow = '';
                    showToast('Notice published successfully!');
                } else {
                    if (noticeModalAlert) {
                        noticeModalAlert.textContent = data.error || 'Failed to publish notice.';
                        noticeModalAlert.classList.remove('hidden');
                    }
                }
            } catch (err) {
                if (noticeModalAlert) {
                    noticeModalAlert.textContent = 'Server error while publishing notice.';
                    noticeModalAlert.classList.remove('hidden');
                }
            }
        });
    }

    // Event Modal
    const adminAddEventBtn = document.getElementById('adminAddEventBtn');
    const eventModal = document.getElementById('eventModal');
    const eventModalCloseBtn = document.getElementById('eventModalCloseBtn');
    const eventModalBackdropClose = document.getElementById('eventModalBackdropClose');
    const eventForm = document.getElementById('eventForm');
    const eventModalAlert = document.getElementById('eventModalAlert');

    if (adminAddEventBtn) {
        adminAddEventBtn.addEventListener('click', () => {
            if (eventModal) {
                eventModal.classList.remove('hidden');
                if (eventModalAlert) eventModalAlert.classList.add('hidden');
                if (eventForm) eventForm.reset();
                document.body.style.overflow = 'hidden';
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        });
    }

    if (eventModalCloseBtn) {
        eventModalCloseBtn.addEventListener('click', () => {
            if (eventModal) {
                eventModal.classList.add('hidden');
                document.body.style.overflow = '';
            }
        });
    }

    if (eventModalBackdropClose) {
        eventModalBackdropClose.addEventListener('click', () => {
            if (eventModal) {
                eventModal.classList.add('hidden');
                document.body.style.overflow = '';
            }
        });
    }

    if (eventForm) {
        eventForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                title: document.getElementById('eventFormTitle').value.trim(),
                type: document.getElementById('eventFormType').value,
                date: document.getElementById('eventFormDate').value,
                location: document.getElementById('eventFormLocation').value.trim(),
                description: document.getElementById('eventFormDesc').value.trim()
            };

            try {
                const res = await fetch('http://127.0.0.1:5000/api/events', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success && data.data) {
                    adminEvents.unshift(data.data);
                    renderAdminEvents();
                    updateStats();
                    if (eventModal) eventModal.classList.add('hidden');
                    document.body.style.overflow = '';
                    showToast('Event created successfully!');
                } else {
                    if (eventModalAlert) {
                        eventModalAlert.textContent = data.error || 'Failed to create event.';
                        eventModalAlert.classList.remove('hidden');
                    }
                }
            } catch (err) {
                if (eventModalAlert) {
                    eventModalAlert.textContent = 'Server error while saving event.';
                    eventModalAlert.classList.remove('hidden');
                }
            }
        });
    }

    // Initial load
    loadAllData();
});
