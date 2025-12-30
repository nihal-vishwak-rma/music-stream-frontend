/* ===================== UI HELPERS ===================== */

/* ---------- ERROR POPUP ---------- */
export function showErrorPopup(message, duration = 3000) {
    const popup = document.getElementById('error-popup');
    if (!popup) {
        console.warn("Error popup element not found");
        return;
    }

    popup.innerText = message;
    popup.style.display = 'block';

    setTimeout(() => {
        popup.style.display = 'none';
    }, duration);
}

/* ---------- SUCCESS POPUP ---------- */
export function showSuccessPopup(message, duration = 3000) {
    const popup = document.getElementById('success-popup');
    if (!popup) {
        console.warn("Success popup element not found");
        return;
    }

    popup.innerText = message;
    popup.style.display = 'block';

    setTimeout(() => {
        popup.style.display = 'none';
    }, duration);
}

/* ---------- MODAL HELPERS ---------- */
export function openModel(id) {
    const modal = document.getElementById(id);
    if (!modal) {
        console.warn("Modal not found:", id);
        return;
    }
    modal.style.display = 'flex';
}

export function closeModal(id) {
    const modal = document.getElementById(id);
    if (!modal) {
        console.warn("Modal not found:", id);
        return;
    }
    modal.style.display = 'none';
}


document.querySelectorAll(".close-modal").forEach(btn => {
    btn.addEventListener("click", () => {
        const modalId = btn.dataset.modal;
        if (modalId) {
            closeModal(modalId);
        }
    });
});



/* ---------- SPECIFIC MODALS ---------- */
export function openSignupModel() {
    openModel("signup-model");
}

export function openLoginModel() {
    openModel("login-model");
}

export function openOtpModal() {
    openModel("otp-model");
}

export function openForgotPasswordModal() {
    openModel("forgot-password-model");
}

export function openCreatePrivatePlaylistModel() {
    openModel("create-private-playlist-model");
}

export function openCreateCollabPlaylistModel() {
    openModel("create-collab-playlist-model");
}
