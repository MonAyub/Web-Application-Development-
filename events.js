/**
 * Narsingdi District Student Council, MBSTU
 * Events Calendar & Activities Page Logic (events.js)
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Guard page - redirect to login if unauthenticated
    if (!Auth.guardPage()) return;

    // 2. Initialize Navbar with auth state
    Auth.renderNavbar('events');
    await Auth.verifySession();
    Auth.renderNavbar('events');
    const API_BASE_URL = 'http://127.0.0.1:5000/api';

    const isAdmin = Auth.isAdmin();

    let allEvents = [];
    let currentEventStatus = 'Upcoming';

    const tabBtnUpcoming = document.getElementById('tabBtnUpcoming');
    const tabBtnCompleted = document.getElementById('tabBtnCompleted');
    const countUpcoming = document.getElementById('countUpcoming');
    const countCompleted = document.getElementById('countCompleted');
    const eventsGrid = document.getElementById('eventsGrid');
    const eventsEmptyState = document.getElementById('eventsEmptyState');
    const adminEventControls = document.getElementById('adminEventControls');
    const eventSearchInput = document.getElementById('eventSearchInput');
    let eventSearchQuery = '';

    if (eventSearchInput) {
        eventSearchInput.addEventListener('input', (e) => {
            eventSearchQuery = (e.target.value || '').toLowerCase().trim();
            renderEvents();
        });
    }

    if (isAdmin && adminEventControls) {
        adminEventControls.classList.remove('hidden');
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

    async function fetchEvents() {
        try {
            const res = await fetch('http://127.0.0.1:5000/api/events');
            const result = await res.json();
            if (result.success && Array.isArray(result.data)) {
                allEvents = result.data;
                updateTabCounts();
                renderEvents();
            }
        } catch (err) {
            console.error('Failed to fetch events:', err);
        }
    }

    function updateTabCounts() {
        const upcomingCount = allEvents.filter(e => (e.type || 'Upcoming').toLowerCase() === 'upcoming').length;
        const completedCount = allEvents.filter(e => (e.type || '').toLowerCase() === 'completed').length;
        if (countUpcoming) countUpcoming.textContent = upcomingCount;
        if (countCompleted) countCompleted.textContent = completedCount;
    }

    function renderEvents() {
        if (!eventsGrid) return;

        const filtered = allEvents.filter(ev => {
            const matchesStatus = (ev.type || 'Upcoming').toLowerCase() === currentEventStatus.toLowerCase();
            if (!matchesStatus) return false;
            if (!eventSearchQuery) return true;
            const title = (ev.title || '').toLowerCase();
            const loc = (ev.location || '').toLowerCase();
            const desc = (ev.description || '').toLowerCase();
            return title.includes(eventSearchQuery) || loc.includes(eventSearchQuery) || desc.includes(eventSearchQuery);
        });

        if (filtered.length === 0) {
            eventsGrid.innerHTML = '';
            eventsGrid.classList.add('hidden');
            if (eventsEmptyState) eventsEmptyState.classList.remove('hidden');
            return;
        }

        if (eventsEmptyState) eventsEmptyState.classList.add('hidden');
        eventsGrid.classList.remove('hidden');

        eventsGrid.innerHTML = filtered.map(ev => {
            const isUpcoming = (ev.type || '').toLowerCase() === 'upcoming';
            return `
                <div class="event-card glass-card reveal active" data-id="${ev._id}" data-event-status="${ev.type}">
                    ${Auth.isAdmin() ? `
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
        }).join('');

        // Attach Delete Listeners for Event Cards
        document.querySelectorAll('.delete-event-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                const title = btn.getAttribute('data-title');
                if (confirm(`Are you sure you want to delete event "${title}"?`)) {
                    await deleteEvent(id);
                }
            });
        });

        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    async function deleteEvent(id) {
        const authToken = Auth.getToken();
        if (!authToken) return showToast('Admin authentication required', false);

        try {
            const res = await fetch(`http://127.0.0.1:5000/api/events/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await res.json();
            if (data.success) {
                showToast('Event deleted successfully!');
                allEvents = allEvents.filter(ev => ev._id !== id);
                updateTabCounts();
                renderEvents();
            } else {
                showToast(data.error || 'Failed to delete event', false);
            }
        } catch (err) {
            showToast('Server error while deleting event', false);
        }
    }

    if (tabBtnUpcoming && tabBtnCompleted) {
        tabBtnUpcoming.addEventListener('click', () => {
            tabBtnUpcoming.classList.add('active');
            tabBtnCompleted.classList.remove('active');
            currentEventStatus = 'Upcoming';
            renderEvents();
        });

        tabBtnCompleted.addEventListener('click', () => {
            tabBtnCompleted.classList.add('active');
            tabBtnUpcoming.classList.remove('active');
            currentEventStatus = 'Completed';
            renderEvents();
        });
    }

    // Event Modal (Add Event)
    const openAddEventBtn = document.getElementById('openAddEventBtn');
    const eventModal = document.getElementById('eventModal');
    const eventModalCloseBtn = document.getElementById('eventModalCloseBtn');
    const eventModalBackdropClose = document.getElementById('eventModalBackdropClose');
    const eventForm = document.getElementById('eventForm');
    const eventModalAlert = document.getElementById('eventModalAlert');

    function openEventModal() {
        if (eventModal) {
            eventModal.classList.remove('hidden');
            if (eventModalAlert) eventModalAlert.classList.add('hidden');
            if (eventForm) eventForm.reset();
            document.body.style.overflow = 'hidden';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    }

    function closeEventModal() {
        if (eventModal) {
            eventModal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }

    if (openAddEventBtn) openAddEventBtn.addEventListener('click', openEventModal);
    if (eventModalCloseBtn) eventModalCloseBtn.addEventListener('click', closeEventModal);
    if (eventModalBackdropClose) eventModalBackdropClose.addEventListener('click', closeEventModal);

    if (eventForm) {
        eventForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const authToken = Auth.getToken();
            if (!authToken) return showToast('Admin authentication required', false);

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
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success && data.data) {
                    allEvents.unshift(data.data);
                    updateTabCounts();
                    renderEvents();
                    closeEventModal();
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

    fetchEvents();
});
