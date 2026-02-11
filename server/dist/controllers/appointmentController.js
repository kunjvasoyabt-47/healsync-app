"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.approveAppointment = exports.getPatientAppointments = exports.createAppointment = void 0;
const AppointmentService = __importStar(require("../services/appointment.service"));
const createAppointment = async (req, res) => {
    try {
        const { doctorId, date, timeSlot, reason, symptoms } = req.body;
        // Safety check: Ensure user is actually attached to the request
        if (!req.user?.userId) {
            return res.status(401).json({ error: "Unauthorized: Patient ID missing" });
        }
        const patientUserId = req.user.userId;
        const file = req.file;
        const appointment = await AppointmentService.createAppointmentService({
            doctorUserId: doctorId,
            patientUserId,
            date,
            timeSlot,
            reason,
            symptoms
        }, file);
        return res.status(201).json({
            message: "Appointment created successfully!",
            appointment,
        });
    }
    catch (error) {
        //  Handle specific Service-level errors
        if (error.message === "DOCTOR_NOT_FOUND") {
            return res.status(404).json({ error: "Doctor not found" });
        }
        if (error.message === "PATIENT_NOT_FOUND") {
            return res.status(404).json({ error: "Patient profile incomplete" });
        }
        //  Handle Race Conditions (Service check OR Database unique constraint)
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
exports.createAppointment = createAppointment;
const getPatientAppointments = async (req, res) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const userId = req.user.userId;
        const appointments = await AppointmentService.getPatientAppointmentsService(userId);
        return res.status(200).json(appointments);
    }
    catch (error) {
        console.error("Get Appointments Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.getPatientAppointments = getPatientAppointments;
const approveAppointment = async (req, res) => {
    try {
        const { id } = req.params; // Appointment ID from URL
        const result = await AppointmentService.approveAppointmentService(id);
        return res.status(200).json({
            success: true,
            message: "Appointment approved and payment link sent to patient.",
            data: result
        });
    }
    catch (error) {
        console.error("Approve Controller Error:", error.message);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};
exports.approveAppointment = approveAppointment;
//# sourceMappingURL=appointmentController.js.map