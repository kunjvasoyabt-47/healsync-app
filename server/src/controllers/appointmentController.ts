import { Request, Response } from "express";
import * as AppointmentService from "../services/appointment.service";

// Extend Request type to include properties from middleware
interface AuthenticatedRequest extends Request {
  file?: any;
  user?: any;
}

export const createAppointment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { doctorId, date, timeSlot, reason, symptoms } = req.body;
    const patientUserId = req.user.userId;
    const file = req.file; 

    const appointment = await AppointmentService.createAppointmentService(
      { doctorUserId: doctorId, patientUserId, date, timeSlot, reason, symptoms },
      file
    );

    return res.status(201).json({
      message: "Appointment created successfully!",
      appointment,
    });
  } catch (error: any) {
    if (error.message === "DOCTOR_NOT_FOUND") return res.status(404).json({ error: "Doctor not found" });
    if (error.message === "PATIENT_NOT_FOUND") return res.status(404).json({ error: "Patient profile incomplete" });
    
    if (error.code === "P2002") {
      return res.status(409).json({ error: "This slot is already booked." });
    }

    console.error("Controller Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getPatientAppointments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user.userId;
    const appointments = await AppointmentService.getPatientAppointmentsService(userId);
    return res.status(200).json(appointments);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};