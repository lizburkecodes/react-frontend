// src/auth.js
// User state management - tokens stored in HttpOnly cookies (not accessible to JavaScript)

export const AUTH_CHANGED_EVENT = "auth:changed";

// User data stored in memory (via React context, NOT localStorage)
let currentUser = null;

export function getUser() {
  return currentUser;
}

export function setUser(user) {
  currentUser = user;
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function clearUser() {
  currentUser = null;
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function isAuthenticated() {
  return !!currentUser;
}
