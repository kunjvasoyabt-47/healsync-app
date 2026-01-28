import express from "express";
import { getMyProfile, updateMyProfile } from "../controllers/patientController";
import { verifyToken } from "../middle/authMiddleware";
import { PATIENT_ROUTES } from "../config/routes";

const router = express.Router();

// Protected patient routes
router.get(PATIENT_ROUTES.ME, verifyToken, getMyProfile);
router.put(PATIENT_ROUTES.ME, verifyToken, updateMyProfile);

export default router;
