import { showErrorPopup } from "./ui.js";


export async function authFetch(url, options = {}) {
    let token = localStorage.getItem("token");

    const headers = {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
    };

    let response = await fetch(url, {
        ...options,
        headers
    });

   
    if (response.status === 401) {
        const refreshed = await refreshAccessToken();

        if (!refreshed) {
            showErrorPopup("Session expired. Please login again.");
            localStorage.clear();
            location.reload();
            throw new Error("Unauthorized");
        }

        
        const newToken = localStorage.getItem("token");

        return fetch(url, {
            ...options,
            headers: {
                ...headers,
                Authorization: `Bearer ${newToken}`
            }
        });
    }

    return response;
}

async function refreshAccessToken() {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return false;

    try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshtoken: refreshToken })
        });

        if (!res.ok) return false;

        const data = await res.json();

        if (data.success && data.data?.token) {
            localStorage.setItem("token", data.data.token);
            return true;
        }
        return false;
    } catch {
        return false;
    }
}
