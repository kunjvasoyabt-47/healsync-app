import { Router } from "express";
import { setDoctorSchedule, getAvailableSlots } from "../controllers/availabilityController";
import { verifyToken } from "../middle/authMiddleware";

const router = Router();

// Matches: POST /api/availability/dc9a.../set-schedule
router.post("/:doctorId/set-schedule", verifyToken, setDoctorSchedule);

// Matches: GET /api/availability/dc9a.../slots
router.get("/:doctorId/slots", getAvailableSlots);

export default router;