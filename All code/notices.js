/**
 * Narsingdi District Student Council, MBSTU
 * Notices & Announcements Page Logic (notices.js)
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Guard page - redirect to login if unauthenticated
    if (!Auth.guardPage()) return;

    // 2. Initialize Navbar with auth state
    Auth.renderNavbar('notices');
    await Auth.verifySession();
    Auth.renderNavbar('notices');
    const API_BASE_URL = 'http://127.0.0.1:5000/api';

    const isAdmin = Auth.isAdmin();

    let allNotices = [];
    let activeNewsCategory = 'ALL';

    const newsSearchInput = document.getElementById('newsSearchInput');
    const newsGrid = document.getElementById('newsGrid');
    const newsEmptyState = document.getElementById('newsEmptyState');
    const newsCategoryBtns = document.querySelectorAll('[data-news-category]');
    const adminNoticeControls = document.getElementById('adminNoticeControls');

    if (isAdmin && adminNoticeControls) {
        adminNoticeControls.classList.remove('hidden');
    }

    // Details Modal elements
    const newsDetailsModal = document.getElementById('newsDetailsModal');
    const newsModalCloseBtn = document.getElementById('newsModalCloseBtn');
    const newsModalBackdropClose = document.getElementById('newsModalBackdropClose');
    const modalTypeTag = document.getElementById('modalTypeTag');
    const modalTitle = document.getElementById('modalTitle');
    const modalDate = document.getElementById('modalDate');
    const modalContent = document.getElementById('modalContent');
    const modalCloseActionBtn = document.getElementById('modalCloseActionBtn');

    // Toast helper
    const toast = document.getElementById('copyToast');
    const toastText = document.getElementById('toastText');
    function showToast(message, isSuccess = true) {
        if (!toast || !toastText) return;
        toastText.textContent = message;
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 3500);
    }

    async function fetchNotices() {
        try {
            const res = await fetch('http://127.0.0.1:5000/api/notices');
            const result = await res.json();
            if (result.success && Array.isArray(result.data)) {
                allNotices = result.data;
                renderNotices();
            }
        } catch (err) {
            console.error('Failed to fetch notices:', err);
        }
    }

    function renderNotices() {
        if (!newsGrid) return;

        const query = (newsSearchInput ? newsSearchInput.value : '').toLowerCase().trim();

        const filtered = allNotices.filter(item => {
            const cat = (item.category || 'NOTICE').toUpperCase();
            const matchesCategory = activeNewsCategory === 'ALL' || cat === activeNewsCategory;
            const matchesSearch =
                (item.title || '').toLowerCase().includes(query) ||
                (item.content || '').toLowerCase().includes(query);
            return matchesCategory && matchesSearch;
        });

        if (filtered.length === 0) {
            newsGrid.innerHTML = '';
            newsGrid.classList.add('hidden');
            if (newsEmptyState) newsEmptyState.classList.remove('hidden');
            return;
        }

        if (newsEmptyState) newsEmptyState.classList.add('hidden');
        newsGrid.classList.remove('hidden');

        newsGrid.innerHTML = filtered.map(item => {
            const isNotice = (item.category || 'NOTICE').toUpperCase() === 'NOTICE';
            return `
                <div class="news-card glass-card reveal active" data-id="${item._id}">
                    ${Auth.isAdmin() ? `
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
        }).join('');

        // Attach Read Details listeners
        document.querySelectorAll('.read-details-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const item = allNotices.find(n => n._id === id);
                if (item) openNewsDetailsModal(item);
            });
        });

        // Attach Delete listeners
        document.querySelectorAll('.delete-notice-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                const title = btn.getAttribute('data-title');
                if (confirm(`Are you sure you want to delete notice "${title}"?`)) {
                    await deleteNotice(id);
                }
            });
        });

        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    async function deleteNotice(id) {
        const authToken = Auth.getToken();
        if (!authToken) return showToast('Admin authentication required', false);

        try {
            const res = await fetch(`http://127.0.0.1:5000/api/notices/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await res.json();
            if (data.success) {
                showToast('Announcement deleted successfully!');
                allNotices = allNotices.filter(n => n._id !== id);
                renderNotices();
            } else {
                showToast(data.error || 'Failed to delete notice', false);
            }
        } catch (err) {
            showToast('Server error while deleting notice', false);
        }
    }

    function openNewsDetailsModal(item) {
        if (!newsDetailsModal) return;
        const isNotice = (item.category || 'NOTICE').toUpperCase() === 'NOTICE';
        modalTypeTag.textContent = item.category;
        modalTypeTag.className = `modal-type-tag ${isNotice ? 'badge-notice' : 'badge-news'}`;
        modalTitle.textContent = item.title;
        modalDate.textContent = `Published on: ${item.date}`;
        modalContent.textContent = item.content;

        newsDetailsModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function closeNewsDetailsModal() {
        if (newsDetailsModal) {
            newsDetailsModal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }

    if (newsModalCloseBtn) newsModalCloseBtn.addEventListener('click', closeNewsDetailsModal);
    if (newsModalBackdropClose) newsModalBackdropClose.addEventListener('click', closeNewsDetailsModal);
    if (modalCloseActionBtn) modalCloseActionBtn.addEventListener('click', closeNewsDetailsModal);

    newsCategoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            newsCategoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeNewsCategory = btn.getAttribute('data-news-category');
            renderNotices();
        });
    });

    if (newsSearchInput) newsSearchInput.addEventListener('input', renderNotices);

    // Publish Notice Modal
    const openAddNoticeBtn = document.getElementById('openAddNoticeBtn');
    const noticeModal = document.getElementById('noticeModal');
    const noticeModalCloseBtn = document.getElementById('noticeModalCloseBtn');
    const noticeModalBackdropClose = document.getElementById('noticeModalBackdropClose');
    const noticeForm = document.getElementById('noticeForm');
    const noticeModalAlert = document.getElementById('noticeModalAlert');

    function openNoticeModal() {
        if (noticeModal) {
            noticeModal.classList.remove('hidden');
            if (noticeModalAlert) noticeModalAlert.classList.add('hidden');
            if (noticeForm) {
                noticeForm.reset();
                const dateInput = document.getElementById('noticeFormDate');
                if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
            }
            document.body.style.overflow = 'hidden';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    }

    function closeNoticeModal() {
        if (noticeModal) {
            noticeModal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }

    if (openAddNoticeBtn) openAddNoticeBtn.addEventListener('click', openNoticeModal);
    if (noticeModalCloseBtn) noticeModalCloseBtn.addEventListener('click', closeNoticeModal);
    if (noticeModalBackdropClose) noticeModalBackdropClose.addEventListener('click', closeNoticeModal);

    if (noticeForm) {
        noticeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const authToken = Auth.getToken();
            if (!authToken) return showToast('Admin authentication required', false);

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
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success && data.data) {
                    allNotices.unshift(data.data);
                    renderNotices();
                    closeNoticeModal();
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

    fetchNotices();
});
