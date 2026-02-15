import axios from "axios";
import Cookies from "js-cookie";
import { useAuthStore } from "@/stores/auth";
import csrfManager from "@/utils/csrf-manager";

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor to add auth token and CSRF token
axios.interceptors.request.use(
  async (config) => {
    // Add authentication token
    const token = Cookies.get("l_t");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add CSRF token for state-changing requests (POST, PUT, DELETE, PATCH)
    const csrfToken = csrfManager.getToken();
    if (
      csrfToken &&
      ["POST", "PUT", "DELETE", "PATCH"].includes(config.method?.toUpperCase())
    ) {
      config.headers["X-CSRF-Token"] = csrfToken;
    }

    // Ensure credentials are included for CSRF protection
    config.withCredentials = true;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and CSRF token refresh
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle CSRF token expiration (403 Forbidden with CSRF error)
    if (
      error.response?.status === 403 &&
      (error.response.data?.message?.toLowerCase().includes("csrf") ||
        error.response.data?.message?.toLowerCase().includes("antiforgery"))
    ) {
      console.log("CSRF token expired, refreshing...");
      try {
        await csrfManager.refreshToken();
        const newCsrfToken = csrfManager.getToken();

        if (
          newCsrfToken &&
          ["POST", "PUT", "DELETE", "PATCH"].includes(
            originalRequest.method?.toUpperCase()
          )
        ) {
          originalRequest.headers["X-CSRF-Token"] = newCsrfToken;
        }

        // Retry the original request with new CSRF token
        return axios(originalRequest);
      } catch (csrfError) {
        console.error("Failed to refresh CSRF token:", csrfError);
        return Promise.reject(error);
      }
    }

    // If the error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If we're already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axios(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh the token
        const authStore = useAuthStore();
        await authStore.refreshToken(); // This will handle the refresh logic

        // Update the original request with new token
        const newToken = Cookies.get("l_t");
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // Process queued requests
        processQueue(null, newToken);

        // Retry the original request
        return axios(originalRequest);
      } catch (refreshError) {
        // If refresh fails, process queue with error and redirect to login
        processQueue(refreshError, null);

        // Clear auth and redirect to login
        const authStore = useAuthStore();
        authStore.logout();

        // Redirect to login page
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axios;
