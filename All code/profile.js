/**
 * Narsingdi District Student Council, MBSTU
 * User Profile View & Edit Logic (profile.js)
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Guard page
    if (!Auth.guardPage()) return;

    // 2. Render Navbar
    Auth.renderNavbar('profile');
    const API_BASE_URL = 'http://127.0.0.1:5000/api';

    const token = Auth.getToken();
    const profileForm = document.getElementById('profileForm');
    const profileAlert = document.getElementById('profileAlert');
    const profileSuccessAlert = document.getElementById('profileSuccessAlert');
    const saveProfileBtn = document.getElementById('saveProfileBtn');

    const inputName = document.getElementById('profileName');
    const inputEmail = document.getElementById('profileEmail');
    const inputRole = document.getElementById('profileRole');
    const inputDept = document.getElementById('profileDept');
    const inputSession = document.getElementById('profileSession');
    const inputUpazila = document.getElementById('profileUpazila');
    const inputPhone = document.getElementById('profilePhone');
    const inputWhatsApp = document.getElementById('profileWhatsApp');
    const inputPic = document.getElementById('profilePic');

    const avatarInitials = document.getElementById('profileAvatarInitials');
    const avatarImg = document.getElementById('profileAvatarImg');

    function showAlert(msg, isSuccess = false) {
        if (isSuccess) {
            if (profileAlert) profileAlert.classList.add('hidden');
            if (profileSuccessAlert) {
                profileSuccessAlert.textContent = msg;
                profileSuccessAlert.classList.remove('hidden');
            }
        } else {
            if (profileSuccessAlert) profileSuccessAlert.classList.add('hidden');
            if (profileAlert) {
                profileAlert.textContent = msg;
                profileAlert.classList.remove('hidden');
            }
        }
        window.scrollTo({ top: 150, behavior: 'smooth' });
    }

    // Load Profile
    async function loadProfile() {
        try {
            const res = await fetch('http://127.0.0.1:5000/api/users/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.success && data.user) {
                const u = data.user;
                Auth.setSession(token, u);
                Auth.renderNavbar('profile');

                if (inputName) inputName.value = u.name || '';
                if (inputEmail) inputEmail.value = u.email || '';
                if (inputRole) inputRole.value = (u.role === 'admin' || u.role === 'superadmin') ? 'Administrator' : 'General Member';
                if (inputDept) inputDept.value = u.department || '';
                if (inputSession) inputSession.value = u.session || '';
                if (inputUpazila) inputUpazila.value = u.upazila || '';
                if (inputPhone) inputPhone.value = u.phone || '';
                if (inputWhatsApp) inputWhatsApp.value = u.whatsapp || u.phone || '';
                if (inputPic) inputPic.value = u.profilePicture || '';

                // Update Avatar
                const displayName = u.name || u.username || 'User';
                const initials = displayName
                    .split(' ')
                    .map(w => w[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase() || 'U';

                if (u.profilePicture && avatarImg) {
                    avatarImg.src = u.profilePicture;
                    avatarImg.classList.remove('hidden');
                    if (avatarInitials) avatarInitials.classList.add('hidden');
                } else if (avatarInitials) {
                    avatarInitials.textContent = initials;
                    avatarInitials.classList.remove('hidden');
                    if (avatarImg) avatarImg.classList.add('hidden');
                }

                if (typeof lucide !== 'undefined') lucide.createIcons();
            } else {
                Auth.clearSession();
                window.location.href = 'login.html';
            }
        } catch (err) {
            showAlert('Failed to connect to the server.');
        }
    }

    // Save Profile
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!inputName.value.trim() || !inputDept.value || !inputSession.value || !inputUpazila.value || !inputPhone.value.trim()) {
                return showAlert('Please fill in all required fields (Name, Department, Session, Upazila, Phone).');
            }

            const payload = {
                name: inputName.value.trim(),
                department: inputDept.value.trim(),
                session: inputSession.value.trim(),
                upazila: inputUpazila.value.trim(),
                phone: inputPhone.value.trim(),
                whatsapp: inputWhatsApp.value.trim() || inputPhone.value.trim(),
                profilePicture: inputPic ? inputPic.value.trim() : ''
            };

            if (saveProfileBtn) {
                saveProfileBtn.disabled = true;
                saveProfileBtn.innerHTML = `<i data-lucide="loader" class="icon-xs animate-spin"></i> Saving...`;
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }

            try {
                const res = await fetch('http://127.0.0.1:5000/api/users/me', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();

                if (data.success && data.user) {
                    Auth.setSession(token, data.user);
                    Auth.renderNavbar('profile');
                    showAlert('Profile updated successfully!', true);

                    // Update avatar picture or initials
                    const displayName = data.user.name || 'User';
                    const initials = displayName
                        .split(' ')
                        .map(w => w[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase() || 'U';

                    if (data.user.profilePicture && avatarImg) {
                        avatarImg.src = data.user.profilePicture;
                        avatarImg.classList.remove('hidden');
                        if (avatarInitials) avatarInitials.classList.add('hidden');
                    } else if (avatarInitials) {
                        avatarInitials.textContent = initials;
                        avatarInitials.classList.remove('hidden');
                        if (avatarImg) avatarImg.classList.add('hidden');
                    }
                } else {
                    showAlert(data.error || 'Failed to update profile.');
                }
            } catch (err) {
                showAlert('Server error while saving profile.');
            } finally {
                if (saveProfileBtn) {
                    saveProfileBtn.disabled = false;
                    saveProfileBtn.innerHTML = `<i data-lucide="save" class="icon-xs"></i> Save Changes`;
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                }
            }
        });
    }

    loadProfile();
});
