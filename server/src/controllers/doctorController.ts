import { Request, Response } from "express";
import { doctorService } from "../services/doctor.service";
import { DoctorFilters } from "../interfaces/doctorfilter"; 

export const getAllDoctors = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Extract 'specialty' because that's what you type in Postman/URL
    const { name, city, specialty } = req.query; 

    const doctors = await doctorService.fetchAllDoctors({
      name: name as string,
      city: city as string,
      // 2. Map 'specialty' (from URL) to 'specialization' (for Prisma)
      specialization: specialty as string, 
    });

    res.status(200).json(doctors);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getDoctorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
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