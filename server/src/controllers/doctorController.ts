import { Request, Response } from "express";
import { doctorService } from "../services/doctor.service";
import { DoctorFilters } from "../interfaces/doctorfilter"; 
import { ApptStatus } from "@prisma/client";

export const getAllDoctors = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Extract 'specialty' because that's what you type in Postman/URL
    const { search, city, specialty } = req.query; 

    const doctors = await doctorService.fetchAllDoctors({
      name: search as string,
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
export const getMyAppointments = async (req: any, res: any) => {
  const profileId = req.user?.profileId;

  if (!profileId) {
    return res.status(401).json({ error: "Unauthorized: No profileId in token" });
  }

  console.log("Calling service with profileId:", profileId);
  
  const appointments = await doctorService.getDoctorAppointmentsService(profileId);

  console.log("Service returned:", appointments);

  if (appointments === null) {
    return res.status(404).json({ error: "Doctor not found" });
  }

  return res.status(200).json({
    success: true,
    count: appointments.length,
    data: appointments
  });
};

export const updateStatus = async (req: any, res: any) => {
  try {
    const { appointmentId, status } = req.body;

    if (!Object.values(ApptStatus).includes(status as ApptStatus)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updated = await doctorService.updateAppointmentStatusService(appointmentId, status as ApptStatus);
    return res.status(200).json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};