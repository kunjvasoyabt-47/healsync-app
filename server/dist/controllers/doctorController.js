"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalytics = exports.updateStatus = exports.getMyAppointments = exports.getDoctorById = exports.getAllDoctors = void 0;
const doctor_service_1 = require("../services/doctor.service");
const client_1 = require("@prisma/client");
const getAllDoctors = async (req, res) => {
    try {
        // 1. Extract 'specialty' because that's what you type in Postman/URL
        const { search, city, specialty } = req.query;
        const doctors = await doctor_service_1.doctorService.fetchAllDoctors({
            name: search,
            city: city,
            // 2. Map 'specialty' (from URL) to 'specialization' (for Prisma)
            specialization: specialty,
        });
        res.status(200).json(doctors);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getAllDoctors = getAllDoctors;
const getDoctorById = async (req, res) => {
    try {
        const id = req.params.id;
        const doctor = await doctor_service_1.doctorService.fetchDoctorById(id);
        res.status(200).json(doctor);
    }
    catch (error) {
        if (error.message === "Doctor not found") {
            res.status(404).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: "Error fetching doctor details" });
        }
    }
};
exports.getDoctorById = getDoctorById;
const getMyAppointments = async (req, res) => {
    const profileId = req.user?.profileId;
    if (!profileId) {
        return res.status(401).json({ error: "Unauthorized: No profileId in token" });
    }
    // Call the service function we just updated
    const appointments = await doctor_service_1.doctorService.getDoctorAppointmentsService(profileId);
    if (appointments === null) {
        return res.status(404).json({ error: "Doctor profile not found" });
    }
    // Standardize the response structure
    return res.status(200).json({
        success: true,
        count: appointments.length,
        data: appointments
    });
};
exports.getMyAppointments = getMyAppointments;
const updateStatus = async (req, res) => {
    try {
        const { appointmentId, status } = req.body;
        if (!Object.values(client_1.ApptStatus).includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }
        const updated = await doctor_service_1.doctorService.updateAppointmentStatusService(appointmentId, status);
        return res.status(200).json(updated);
    }
    catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.updateStatus = updateStatus;
const getAnalytics = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: Missing credentials" });
        }
        const analytics = await doctor_service_1.doctorService.getDoctorAnalytics(userId);
        return res.status(200).json({
            success: true,
            data: analytics
        });
    }
    catch (error) {
        console.error("Analytics Controller Error:", error);
        return res.status(500).json({
            message: error.message || "Internal server error while fetching analytics"
        });
    }
};
exports.getAnalytics = getAnalytics;
//# sourceMappingURL=doctorController.js.map