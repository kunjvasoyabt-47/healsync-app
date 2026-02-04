export const AUTH_ROUTES = {
  REGISTER: "/auth/register",
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  FORGET_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  ME: "/auth/me",
};

// 🟢 PAGE_ROUTES: For router.push() and <Link />
export const PAGE_ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password", // route usually /reset-password/[token]
  
  // Patient Pages
  DOCTORS: "/doctors",
  DOCTOR_DETAIL: (id: string) => `/doctors/${id}`,
  MY_APPOINTMENTS: "/appointments",
  
  // Doctor Pages
  DOCTOR_DASHBOARD: "/doctors/dashboard",
};

export const APPOINTMENT_ROUTES = {
  CREATE: "/appointments",
  GET_PATIENT_HISTORY: "/appointments/patient/me",
  CANCEL: (id: string) => `/appointments/${id}/cancel`,
};

export const DOCTOR_ROUTES = {
  GET_ALL: "/doctors",
  GET_BY_ID: (id: string) => `/doctors/${id}`,
  SET_AVAILABILITY: "/availability/set-schedule",
  GET_SLOTS: (doctorId: string, date: string) => `/availability/${doctorId}/slots?date=${date}`,
  GET_MY_APPOINTMENTS: "/my-appointments", 
  UPDATE_STATUS: "/update-status",
};

