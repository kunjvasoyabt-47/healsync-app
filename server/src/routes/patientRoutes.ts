import express from "express";
import { getMyProfile, updateMyProfile } from "../controllers/patientController";
import { verifyToken } from "../middle/authMiddleware"; // The Guard 🛡️

const router = express.Router();

// These routes are PROTECTED. You must be logged in to use them.
router.get("/me", verifyToken, getMyProfile);
router.put("/me", verifyToken, updateMyProfile);

export default router;