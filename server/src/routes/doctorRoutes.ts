import express from "express";
import { getAllDoctors, getDoctorById } from "../controllers/doctorController";
import { DOCTOR_ROUTES } from "../config/routes";

const router = express.Router();

// Public doctor routes
router.get(DOCTOR_ROUTES.GET_ALL, getAllDoctors);
router.get(DOCTOR_ROUTES.GET_BY_ID, getDoctorById);

export default router;
