"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const doctorController_1 = require("../controllers/doctorController");
const authMiddleware_1 = require("../middle/authMiddleware");
const routes_1 = require("../config/routes");
const router = (0, express_1.Router)();
/** * ✅ PUBLIC ROUTES
 * Accessible by anyone (e.g., patient browsing)
 */
router.get(routes_1.DOCTOR_ROUTES.GET_ALL, doctorController_1.getAllDoctors);
/**
 * PROTECTED ROUTES (DOCTOR ONLY)
 * Using a single router-level middleware for all following routes
 * to keep the code DRY (Don't Repeat Yourself).
 */
router.use(authMiddleware_1.verifyToken);
router.get(routes_1.DOCTOR_ROUTES.GET_APPOINTMENTS, doctorController_1.getMyAppointments);
router.patch(routes_1.DOCTOR_ROUTES.UPDATE_STATUS, doctorController_1.updateStatus);
router.get(routes_1.DOCTOR_ROUTES.ANAYTICS, doctorController_1.getAnalytics);
/**
 * PARAMETERIZED ROUTE
 * This is technically public in many apps, but if it stays protected,
 * keep it here. If it should be public, move it ABOVE router.use(verifyToken).
 */
router.get(routes_1.DOCTOR_ROUTES.GET_BY_ID, doctorController_1.getDoctorById);
exports.default = router;
//# sourceMappingURL=doctorRoutes.js.map