/**
 * Narsingdi District Student Council, MBSTU
 * Members Directory Page Logic (members.js)
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Guard page - redirect to login if unauthenticated
    if (!Auth.guardPage()) return;

    // 2. Initialize Navbar with auth state
    Auth.renderNavbar('members');
    await Auth.verifySession();
    Auth.renderNavbar('members');

    const isAdmin = Auth.isAdmin();
    const token = Auth.getToken();
    const API_BASE_URL = 'http://127.0.0.1:5000/api';

    let allMembers = [];
    const membersGrid = document.getElementById('membersGrid');
    const memberSearchInput = document.getElementById('memberSearchInput');
    const filterUpazila = document.getElementById('filterUpazila');
    const filterDepartment = document.getElementById('filterDepartment');
    const filterSession = document.getElementById('filterSession');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    const memberCountText = document.getElementById('memberCountText');
    const noResultsText = document.getElementById('noResultsText');
    const membersEmptyState = document.getElementById('membersEmptyState');
    const emptyStateResetBtn = document.getElementById('emptyStateResetBtn');
    const adminMemberControls = document.getElementById('adminMemberControls');

    // Show admin controls if admin
    if (isAdmin && adminMemberControls) {
        adminMemberControls.classList.remove('hidden');
    }

    // Toast helper
    const toast = document.getElementById('copyToast');
    const toastText = document.getElementById('toastText');
    function showToast(message, isSuccess = true) {
        if (!toast || !toastText) return;
        toastText.textContent = message;
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 3500);
    }

    // Fetch members from API
    async function fetchMembers() {
        try {
            const res = await fetch('http://127.0.0.1:5000/api/members');
            const result = await res.json();
            if (result.success && Array.isArray(result.data)) {
                allMembers = result.data;
                populateMemberFilters();
                renderMembers();
            }
        } catch (err) {
            console.error('Failed to fetch members:', err);
            if (memberCountText) memberCountText.textContent = 'Failed to load member records.';
        }
    }

    function populateMemberFilters() {
        const upazilas = new Set(['Narsingdi Sadar', 'Palash', 'Shibpur', 'Belabo', 'Monohardi', 'Raipura']);
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

        updateSelect(filterUpazila, upazilas, 'All Upazilas');
        updateSelect(filterDepartment, depts, 'All Departments');
        updateSelect(filterSession, sessions, 'All Sessions');
    }

    function renderMembers() {
        if (!membersGrid) return;

        const query = (memberSearchInput ? memberSearchInput.value : '').toLowerCase().trim();
        const upazilaVal = filterUpazila ? filterUpazila.value : '';
        const deptVal = filterDepartment ? filterDepartment.value : '';
        const sessionVal = filterSession ? filterSession.value : '';

        const isFilterActive = query || upazilaVal || deptVal || sessionVal;
        if (resetFiltersBtn) {
            if (isFilterActive) resetFiltersBtn.classList.remove('hidden');
            else resetFiltersBtn.classList.add('hidden');
        }

        const filtered = allMembers.filter(m => {
            const matchesSearch =
                (m.name || '').toLowerCase().includes(query) ||
                (m.department || '').toLowerCase().includes(query) ||
                (m.upazila || '').toLowerCase().includes(query) ||
                (m.session || '').toLowerCase().includes(query) ||
                (m.phone || '').includes(query);

            const matchesUpazila = !upazilaVal || (m.upazila || '').toLowerCase() === upazilaVal.toLowerCase();
            const matchesDept = !deptVal || (m.department || '').toUpperCase() === deptVal.toUpperCase();
            const matchesSession = !sessionVal || (m.session || '') === sessionVal;

            return matchesSearch && matchesUpazila && matchesDept && matchesSession;
        }).sort((a, b) => (b.session || '').localeCompare(a.session || ''));

        if (memberCountText) {
            memberCountText.textContent = `Showing ${filtered.length} of ${allMembers.length} registered council members`;
        }

        if (filtered.length === 0) {
            membersGrid.innerHTML = '';
            membersGrid.classList.add('hidden');
            if (noResultsText) noResultsText.classList.remove('hidden');
            if (membersEmptyState) membersEmptyState.classList.remove('hidden');
            return;
        }

        if (noResultsText) noResultsText.classList.add('hidden');
        if (membersEmptyState) membersEmptyState.classList.add('hidden');
        membersGrid.classList.remove('hidden');

        membersGrid.innerHTML = filtered.map(m => {
            const safePhone = m.phone ? m.phone.replace(/[^0-9+]/g, '') : '';
            const safeWhatsApp = m.whatsapp ? m.whatsapp.replace(/[^0-9]/g, '') : safePhone;

            return `
                <div class="member-card glass-card reveal active" data-id="${m._id}">
                    <div class="member-accent-bar"></div>
                    ${Auth.isAdmin() ? `
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
        }).join('');

        // Attach Delete Listeners for Member Cards
        document.querySelectorAll('.delete-member-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                const name = btn.getAttribute('data-name');
                if (confirm(`Are you sure you want to remove ${name} from the member directory?`)) {
                    await deleteMember(id);
                }
            });
        });

        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    async function deleteMember(id) {
        const authToken = Auth.getToken();
        if (!authToken) return showToast('Admin authentication required', false);

        try {
            const res = await fetch(`http://127.0.0.1:5000/api/members/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await res.json();
            if (data.success) {
                showToast('Member removed successfully!');
                allMembers = allMembers.filter(m => m._id !== id);
                renderMembers();
            } else {
                showToast(data.error || 'Failed to delete member', false);
            }
        } catch (err) {
            showToast('Server error while deleting member', false);
        }
    }

    function resetMemberFilters() {
        if (memberSearchInput) memberSearchInput.value = '';
        if (filterUpazila) filterUpazila.value = '';
        if (filterDepartment) filterDepartment.value = '';
        if (filterSession) filterSession.value = '';
        renderMembers();
    }

    if (memberSearchInput) memberSearchInput.addEventListener('input', renderMembers);
    if (filterUpazila) filterUpazila.addEventListener('change', renderMembers);
    if (filterDepartment) filterDepartment.addEventListener('change', renderMembers);
    if (filterSession) filterSession.addEventListener('change', renderMembers);
    if (resetFiltersBtn) resetFiltersBtn.addEventListener('click', resetMemberFilters);
    if (emptyStateResetBtn) emptyStateResetBtn.addEventListener('click', resetMemberFilters);

    // Member Modal (Add New Member)
    const openAddMemberBtn = document.getElementById('openAddMemberBtn');
    const memberModal = document.getElementById('memberModal');
    const memberModalCloseBtn = document.getElementById('memberModalCloseBtn');
    const memberModalBackdropClose = document.getElementById('memberModalBackdropClose');
    const memberForm = document.getElementById('memberForm');
    const memberModalAlert = document.getElementById('memberModalAlert');

    function openMemberModal() {
        if (memberModal) {
            memberModal.classList.remove('hidden');
            if (memberModalAlert) memberModalAlert.classList.add('hidden');
            if (memberForm) memberForm.reset();
            document.body.style.overflow = 'hidden';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    }

    function closeMemberModal() {
        if (memberModal) {
            memberModal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }

    if (openAddMemberBtn) openAddMemberBtn.addEventListener('click', openMemberModal);
    if (memberModalCloseBtn) memberModalCloseBtn.addEventListener('click', closeMemberModal);
    if (memberModalBackdropClose) memberModalBackdropClose.addEventListener('click', closeMemberModal);

    if (memberForm) {
        memberForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const authToken = Auth.getToken();
            if (!authToken) return showToast('Admin authentication required', false);

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
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success && data.data) {
                    allMembers.unshift(data.data);
                    populateMemberFilters();
                    renderMembers();
                    closeMemberModal();
                    showToast('Member added successfully!');
                } else {
                    if (memberModalAlert) {
                        memberModalAlert.textContent = data.error || 'Failed to add member.';
                        memberModalAlert.classList.remove('hidden');
                    }
                }
            } catch (err) {
                if (memberModalAlert) {
                    memberModalAlert.textContent = 'Error communicating with server.';
                    memberModalAlert.classList.remove('hidden');
                }
            }
        });
    }

    // Initial load
    fetchMembers();
});
