// src/auth.js
// Note: Tokens are now stored in HttpOnly cookies (not localStorage)
// This file manages user data that lives in sessionStorage

export const AUTH_CHANGED_EVENT = "auth:changed";

/**
 * Get user data from session storage
 * Tokens are automatically sent via HttpOnly cookies
 */
export function getUser() {
  try {
    return JSON.parse(sessionStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

/**
 * Store user info after successful login
 * Tokens are automatically set as HttpOnly cookies by server
 */
export function setAuth({ user }) {
  // Store user data (not token - that's in HttpOnly cookie)
  sessionStorage.setItem("user", JSON.stringify(user));
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

/**
 * Clear auth state on logout
 * Tokens are cleared by server via Set-Cookie headers
 */
export function clearAuth() {
  sessionStorage.removeItem("user");
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function isAuthenticated() {
  return !!currentUser;
}
