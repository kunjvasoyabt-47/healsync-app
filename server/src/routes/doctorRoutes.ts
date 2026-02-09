import express from "express";
import { getAllDoctors, getAnalytics, getDoctorById, getMyAppointments, updateStatus } from "../controllers/doctorController";
import { verifyToken } from "../middle/authMiddleware";
import { DOCTOR_ROUTES } from "../config/routes";
const router = express.Router();

// ✅ PUBLIC ROUTES
router.get(DOCTOR_ROUTES.GET_ALL, getAllDoctors);

// ✅ SPECIFIC PROTECTED ROUTES - MUST COME BEFORE /:id
router.get(DOCTOR_ROUTES.GET_APPOINTMENTS, verifyToken, getMyAppointments);
router.patch(DOCTOR_ROUTES.UPDATE_STATUS, verifyToken, updateStatus);
router.get(DOCTOR_ROUTES.ANAYTICS, verifyToken, getAnalytics);

// ✅ PARAMETERIZED ROUTE - MUST BE LAST
router.get(DOCTOR_ROUTES.GET_BY_ID, getDoctorById);

export default router;
