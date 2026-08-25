const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const apiFetch = (endpoint: string, options?: RequestInit) => {
    // Łączy bazowy URL (np. https://bls-calendar.onrender.com) z konkretnym punktem (np. /api/teams)
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    return fetch(url, options);
};