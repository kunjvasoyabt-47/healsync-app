"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDoctorSchedule = exports.getAvailableSlots = void 0;
const db_1 = require("../config/db");
const availability_service_1 = require("../services/availability.service");
const getAvailableSlots = async (req, res) => {
    try {
        // 1. Check if the ID exists in params. 
        // If your route is /:id/slots, use req.params.id
        // If your route is /:doctorId/slots, use req.params.doctorId
        const doctorId = (req.params.id || req.params.doctorId);
        if (!doctorId) {
            return res.status(400).json({ error: "Doctor ID is missing from request" });
        }
        const dateQuery = req.query.date;
        if (!dateQuery) {
            return res.status(400).json({ error: "Date query parameter is required" });
        }
        const availableSlots = await availability_service_1.availabilityService.generateDoctorSlots(doctorId, dateQuery);
        return res.status(200).json({ slots: availableSlots });
    }
    catch (error) {
        console.error("Slot Generation Error:", error);
        return res.status(500).json({ error: "Failed to generate slots" });
    }
};
exports.getAvailableSlots = getAvailableSlots;
const setDoctorSchedule = async (req, res) => {
    try {
        const { doctorId, dayOfWeek, startTime, endTime, slotDuration, isBookable } = req.body;
        const updatedSchedule = await db_1.prisma.availability.upsert({
            where: {
                doctorId_dayOfWeek: { doctorId, dayOfWeek },
            },
            update: {
                startTime,
                endTime,
                slotDuration: slotDuration || 30,
                isBookable: isBookable ?? true,
            },
            create: {
                doctorId,
                dayOfWeek,
                startTime,
                endTime,
                slotDuration: slotDuration || 30,
                isBookable: isBookable ?? true,
            },
        });
        return res.status(200).json({ schedule: updatedSchedule });
    }
    catch (error) {
        return res.status(500).json({ message: "Error saving schedule" });
    }
};
exports.setDoctorSchedule = setDoctorSchedule;
//# sourceMappingURL=availabilityController.js.map