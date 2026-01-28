import { Request, Response } from "express";
import { patientService } from "../services/patient.service";

// GET /api/patients/me
export const getMyProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // req.user is populated by verifyToken middleware
    const userId = req.user.userId;
    const patient = await patientService.fetchProfile(userId);
    
    res.status(200).json(patient);
  } catch (error: any) {
    if (error.message === "Profile not found") {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  }
};

// PUT /api/patients/me
export const updateMyProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user.userId;
    const updatedPatient = await patientService.updateProfile(userId, req.body);

    res.status(200).json({ 
      message: "Profile updated successfully", 
      patient: updatedPatient 
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update profile" });
  }
};