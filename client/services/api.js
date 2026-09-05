// api.js sẽ tạo một instance của axios với baseURL là địa chỉ của backend API, và sử dụng interceptor để tự động đính kèm token JWT vào header của mỗi request nếu token tồn tại trong localStorage. Điều này giúp cho việc xác thực người dùng trở nên dễ dàng hơn khi frontend gửi request đến backend.
import axios from "axios";
import { clearStoredSession, getStoredToken } from "../utils/authStorage";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Tự động đính kèm Token vào Header trước khi gửi request
api.interceptors.request.use(
    (config) => {
        const token = getStoredToken(); // Ta sẽ lưu token ở localStorage khi login
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

api.interceptors.response.use(
    (response) => {
        try {
            const method = response.config?.method?.toLowerCase();
            if (["post", "put", "delete"].includes(method) && response.status >= 200 && response.status < 300) {
                // Dispatch a global event so components can choose to refresh state.
                // Avoid forcing a full page reload which can interrupt multi-step flows
                // (e.g., blockchain tx wait). Consumers may listen to 'api:write' or
                // continue to call their own fetch functions after successful calls.
                try {
                    const detail = { method, url: response.config?.url, data: response.data };
                    window.dispatchEvent(new CustomEvent("api:write", { detail }));
                } catch {
                    // ignore in non-browser environments
                }
            }
        } catch {
            // swallow errors here to avoid breaking normal response handling
        }

        return response;
    },
    (error) => {
        const status = error.response?.status;
        const message = error.response?.data?.message || "";
        const isAuthError = status === 401 || (status === 403 && message.toLowerCase().includes("token"));

        if (isAuthError) {
            clearStoredSession();

            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    },
);

export default api;
