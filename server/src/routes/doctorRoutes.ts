import { Request, Response, Router } from "express";
import { 
  getAllDoctors, 
  getAnalytics, 
  getDoctorById, 
  getMyAppointments, 
  updateStatus 
} from "../controllers/doctorController";
import { verifyToken } from "../middle/authMiddleware";
import { DOCTOR_ROUTES } from "../config/routes";

const router = Router();

/** * ✅ PUBLIC ROUTES
 * Accessible by anyone (e.g., patient browsing)
 */
router.get(DOCTOR_ROUTES.GET_ALL, getAllDoctors);

/**
 * 🔒 PROTECTED ROUTES (DOCTOR ONLY)
 * Using a single router-level middleware for all following routes
 * to keep the code DRY (Don't Repeat Yourself).
 */
router.use(verifyToken); 

router.get(DOCTOR_ROUTES.GET_APPOINTMENTS, getMyAppointments);
router.patch(DOCTOR_ROUTES.UPDATE_STATUS, updateStatus);
router.get(DOCTOR_ROUTES.ANAYTICS, getAnalytics);

/**
 * ✅ PARAMETERIZED ROUTE
 * This is technically public in many apps, but if it stays protected, 
 * keep it here. If it should be public, move it ABOVE router.use(verifyToken).
 */
router.get(DOCTOR_ROUTES.GET_BY_ID, getDoctorById);

export default router;