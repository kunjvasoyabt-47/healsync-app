import express from "express";
import multer from "multer";
import { createAppointment, getPatientAppointments } from "../controllers/appointmentController";
import { verifyToken}  from "../middle/authMiddleware";
import { APPOINTMENT_ROUTES } from "../config/routes";

const router = express.Router();

// Memory storage is required for streaming to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({ storage });

// "report" is the field name the frontend must use in FormData
router.post(
  APPOINTMENT_ROUTES.CREATE, 
  verifyToken, 
  upload.single("report"), 
  createAppointment
);

router.get(
  APPOINTMENT_ROUTES.PATIENT_APPOINTMENTS, 
  verifyToken, 
  getPatientAppointments
);

export default router;