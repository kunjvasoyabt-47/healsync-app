import express from "express";
import { getAllDoctors, getDoctorById } from "../controllers/doctorController";

const router = express.Router();

// Public: Patients need to see doctors to book them
// If mounted at /api/doctors, this handles GET /api/doctors
router.get("/", getAllDoctors);

// Public: View a specific doctor's profile
// If mounted at /api/doctors, this handles GET /api/doctors/:id
router.get("/:id", getDoctorById);

export default router;