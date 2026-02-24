import axios from "axios";
import { clearAuth } from "./auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Track if we're currently refreshing to prevent multiple refresh requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  isRefreshing = false;
  failedQueue = [];
};

// Response interceptor: Handle 401 by refreshing token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { config, response } = error;

    // If error is not 401, reject
    if (response?.status !== 401) {
      return Promise.reject(error);
    }

    // Skip refresh for auth endpoints to avoid infinite loops
    const isAuthEndpoint = 
      config.url?.includes('auth/login') || 
      config.url?.includes('auth/register') ||
      config.url?.includes('auth/refresh') ||
      config.url?.includes('auth/forgot-password') ||
      config.url?.includes('auth/reset-password');
    
    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    // If we're already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => api(config));
    }

    // Start refresh process
    isRefreshing = true;

    return api
      .post("/api/auth/refresh")
      .then(() => {
        // Retry failed request
        processQueue(null);
        return api(config);
      })
      .catch((err) => {
        // Refresh failed, clear auth and redirect to login
        processQueue(err);
        clearAuth();
        window.location.href = "/login";
        return Promise.reject(err);
      });
  }
);

export default api;
