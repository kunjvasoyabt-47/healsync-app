import { Request, Response } from "express";
import { doctorService } from "../services/doctor.service";

// GET /api/doctors
export const getAllDoctors = async (req: Request, res: Response): Promise<void> => {
  try {
    const doctors = await doctorService.fetchAllDoctors();
    res.status(200).json(doctors);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch doctors" });
  }
};

// GET /api/doctors/:id
export const getDoctorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;;
    const doctor = await doctorService.fetchDoctorById(id);
    
    res.status(200).json(doctor);
  } catch (error: any) {
    if (error.message === "Doctor not found") {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Error fetching doctor details" });
    }
  }
};