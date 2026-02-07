import { Request, Response } from "express";
import * as AppointmentService from "../services/appointment.service";

// 🟢 Improved Type Safety: Explicitly define the user structure from your Auth middleware
interface AuthenticatedRequest extends Request {
  file?: Express.Multer.File; // Use proper Multer types
  user?: {
    userId: string;
    role: string;
  };
}

export const createAppointment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { doctorId, date, timeSlot, reason, symptoms } = req.body;
    
    // Safety check: Ensure user is actually attached to the request
    if (!req.user?.userId) {
      return res.status(401).json({ error: "Unauthorized: Patient ID missing" });
    }

    const patientUserId = req.user.userId;
    const file = req.file; 

    const appointment = await AppointmentService.createAppointmentService(
      { 
        doctorUserId: doctorId, 
        patientUserId, 
        date, 
        timeSlot, 
        reason, 
        symptoms 
      },
      file
    );

    return res.status(201).json({
      message: "Appointment created successfully!",
      appointment,
    });

  } catch (error: any) {
    // 🟢 Handle specific Service-level errors
    if (error.message === "DOCTOR_NOT_FOUND") {
      return res.status(404).json({ error: "Doctor not found" });
    }
    if (error.message === "PATIENT_NOT_FOUND") {
      return res.status(404).json({ error: "Patient profile incomplete" });
    }
    
    // 🟢 Handle Race Conditions (Service check OR Database unique constraint)
    // This catches the case where two people book the same slot simultaneously
    if (error.message === "SLOT_ALREADY_BOOKED" || error.code === "P2002") {
      return res.status(409).json({ 
        error: "This slot is already booked. Please select another time." 
      });
    }

    // Log unexpected errors for debugging, but don't leak details to the client
    console.error("Appointment Controller Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getPatientAppointments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.user.userId;
    const appointments = await AppointmentService.getPatientAppointmentsService(userId);
    
    return res.status(200).json(appointments);
  } catch (error) {
    console.error("Get Appointments Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const approveAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // Appointment ID from URL
    const result = await AppointmentService.approveAppointmentService(id);

    return res.status(200).json({
      success: true,
      message: "Appointment approved and payment link sent to patient.",
      data: result
    });
  } catch (error: any) {
    console.error("Approve Controller Error:", error.message);
    return res.status(500).json({ 
      success: false, 
      message: error.message || "Internal Server Error" 
    });
  }
};