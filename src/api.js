import axios from "axios";
import { getAccessToken, getRefreshToken, setAccessToken, clearAuth } from "./auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Track if we're currently refreshing to prevent multiple refresh requests
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
  isRefreshing = false;
  failedQueue = [];
};

// Request interceptor: Attach access token to every request
api.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Response interceptor: Handle 401 by refreshing token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { config, response } = error;

    // If error is not 401 or there's no refresh token, reject
    if (response?.status !== 401 || !getRefreshToken()) {
      return Promise.reject(error);
    }

    // If we're already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          config.headers.Authorization = `Bearer ${token}`;
          return api(config);
        })
        .catch((err) => Promise.reject(err));
    }

    isRefreshing = true;

    // Try to refresh the token
    return new Promise((resolve, reject) => {
      api
        .post("/auth/refresh", {
          refreshToken: getRefreshToken(),
        })
        .then((res) => {
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = res.data;
          
          // Update tokens in storage
          setAccessToken(newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem("refreshToken", newRefreshToken);
          }

          // Retry original request
          config.headers.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);
          resolve(api(config));
        })
        .catch((err) => {
          // Refresh failed - logout user
          clearAuth();
          processQueue(err, null);
          reject(err);
        });
    });
  }
);

export default api;
