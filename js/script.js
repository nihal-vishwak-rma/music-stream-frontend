const API_URL = "http://localhost:8080/api/v1";

// Global token management
let token = localStorage.getItem('token');

let currentSongIndex = -1;

// Auto-load home songs on page load
document.addEventListener('DOMContentLoaded', () => {
    // Load trending songs on startup if user is authenticated
    const token = localStorage.getItem('token');
    if (token) {
        const homePage = document.querySelector("#homePage");
        if (homePage) {
            homePage.click();
        }
    }
});

