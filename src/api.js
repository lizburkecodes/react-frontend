import axios from "axios";
import { clearUser } from "./auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Include HttpOnly cookies in requests
});

// Request interceptor: prepend /api to all endpoints
api.interceptors.request.use((config) => {
  if (!config.url?.startsWith('/api')) {
    config.url = `/api${config.url}`;
  }
  return config;
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
