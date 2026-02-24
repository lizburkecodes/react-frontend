import axios from "axios";
import { clearUser } from "./auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // Enable sending cookies with requests (HttpOnly cookies are automatically sent)
  withCredentials: true,
});

// Token refresh interceptor to handle expired access tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If access token expired (401) and haven't retried yet
    // Skip refresh for auth endpoints to avoid infinite loops
    const isAuthEndpoint = originalRequest.url?.includes('/api/auth/login') || 
                           originalRequest.url?.includes('/api/auth/register') ||
                           originalRequest.url?.includes('/api/auth/refresh') ||
                           originalRequest.url?.includes('/api/auth/forgot-password') ||
                           originalRequest.url?.includes('/api/auth/reset-password');
    
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        // Try to refresh the access token
        // The refresh endpoint returns new tokens in HttpOnly cookies
        await api.post('/api/auth/refresh');
        
        // Retry original request with new access token
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

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

    // If we're already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => api(config));
    }

    // Start refresh process
    isRefreshing = true;

    return api
      .post("/auth/refresh")
      .then(() => {
        // Retry failed request
        return api(config);
      })
      .catch((err) => {
        // Refresh failed, clear auth and redirect to login
        clearUser();
        window.location.href = "/login";
        return Promise.reject(err);
      })
      .finally(() => {
        processQueue(null);
      });
  }
);

export default api;
