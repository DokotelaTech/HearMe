// BASE API URL
const API_BASE_URL = "/api";

// GENERIC FETCH FUNCTION
async function apiRequest(endpoint, method = "GET", body = null) {
    const options = {
        method,
        headers: {
            "Content-Type": "application/json"
        }
    };

    // TOKEN LATER
    const token = localStorage.getItem("token");

    if (token) {
        options.headers.Authorization = `Bearer ${token}`;
    }

    // BODY
    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Something went wrong");
        }

        return data;

    } catch (error) {
        console.error("API ERROR:", error.message);
        return null;
    }
}