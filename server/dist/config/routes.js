"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APPOINTMENT_ROUTES = exports.AVAILABILITY_ROUTES = exports.PATIENT_ROUTES = exports.DOCTOR_ROUTES = exports.AUTH_ROUTES = exports.API_BASE = void 0;
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
    ME: "/me",
    REFRESH_TOKEN: "/refresh-token",
};
// Doctor routes
exports.DOCTOR_ROUTES = {
    BASE: `${exports.API_BASE}/doctors`,
    GET_ALL: "/",
    GET_BY_ID: "/:id",
    GET_APPOINTMENTS: "/my-appointments",
    UPDATE_STATUS: "/update-status",
    ANAYTICS: "/analytics",
};
// Patient routes
exports.PATIENT_ROUTES = {
    BASE: `${exports.API_BASE}/patients`,
    ME: "/me",
};
exports.AVAILABILITY_ROUTES = {
    BASE: `${exports.API_BASE}/availability`,
    SET: "/set",
    GET: "/get/:id",
};
exports.APPOINTMENT_ROUTES = {
    BASE: `${exports.API_BASE}/appointments`,
    CREATE: "/",
    PATIENT_APPOINTMENTS: "/patient-list",
};
//# sourceMappingURL=routes.js.map