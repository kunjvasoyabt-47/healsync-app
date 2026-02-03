"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PATIENT_ROUTES = exports.DOCTOR_ROUTES = exports.AUTH_ROUTES = exports.API_BASE = void 0;
// API base path
exports.API_BASE = "/api";
// Auth routes
exports.AUTH_ROUTES = {
    BASE: `${exports.API_BASE}/auth`,
    REGISTER: "/register",
    LOGIN: "/login",
    LOGOUT: "/logout",
    FORGET_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",
};
// Doctor routes
exports.DOCTOR_ROUTES = {
    BASE: `${exports.API_BASE}/doctors`,
    GET_ALL: "/",
    GET_BY_ID: "/:id",
};
// Patient routes
exports.PATIENT_ROUTES = {
    BASE: `${exports.API_BASE}/patients`,
    ME: "/me",
};
//# sourceMappingURL=routes.js.map