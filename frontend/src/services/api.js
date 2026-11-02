
import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
});

// Add JWT token and handle multipart requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Let the browser automatically set the multipart boundary.
        if (
            typeof FormData !== "undefined" &&
            config.data instanceof FormData
        ) {
            if (typeof config.headers.delete === "function") {
                config.headers.delete("Content-Type");
            } else {
                delete config.headers["Content-Type"];
                delete config.headers["content-type"];
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Handle authentication errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("student");

            const currentPath = window.location.pathname;

            if (
                currentPath !== "/login" &&
                currentPath !== "/register"
            ) {
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

export default api;
