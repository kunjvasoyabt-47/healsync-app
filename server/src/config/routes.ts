// API base path
export const API_BASE = "/api";

// Auth routes
export const AUTH_ROUTES = {
  BASE: `${API_BASE}/auth`,
  REGISTER: "/register",
  LOGIN: "/login",
  LOGOUT: "/logout",
  FORGET_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
};

// Doctor routes
export const DOCTOR_ROUTES = {
  BASE: `${API_BASE}/doctors`,
  GET_ALL: "/",
  GET_BY_ID: "/:id",
};

// Patient routes
export const PATIENT_ROUTES = {
  BASE: `${API_BASE}/patients`,
  ME: "/me",
};
