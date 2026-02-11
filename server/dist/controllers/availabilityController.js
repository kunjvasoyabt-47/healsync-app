"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableSlots = exports.setDoctorSchedule = void 0;
const db_1 = require("../config/db");
const availability_service_1 = require("../services/availability.service");
const setDoctorSchedule = async (req, res) => {
    try {
        const { doctorId: userId } = req.params;
        const { dayOfWeek, startTime, endTime, slotDuration, isBookable } = req.body;
        // Log the userId to make sure it's reaching the server
        console.log("Setting schedule for User ID:", userId);
        const profile = await db_1.prisma.doctorProfile.findUnique({ where: { userId } });
        if (!profile) {
            console.error("No DoctorProfile found for this User ID");
            return res.status(404).json({ error: "Doctor profile not found" });
        }
        const updatedSchedule = await db_1.prisma.availability.upsert({
            where: {
                // Ensure this composite key (doctorId_dayOfWeek) exists in your schema.prisma
                doctorId_dayOfWeek: {
                    doctorId: profile.id,
                    dayOfWeek: Number(dayOfWeek)
                },
            },
            update: {
                startTime,
                endTime,
                slotDuration: slotDuration || 30,
                isBookable: isBookable ?? true,
            },
            create: {
                doctorId: profile.id,
                dayOfWeek: Number(dayOfWeek),
                startTime,
                endTime,
                slotDuration: slotDuration || 30,
                isBookable: isBookable ?? true,
            },
        });
        return res.status(200).json({ schedule: updatedSchedule });
    }
    catch (error) {
        // THIS LINE WILL TELL YOU THE EXACT PRISMA ERROR IN YOUR TERMINAL
        console.error("DETAILED DATABASE ERROR:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.setDoctorSchedule = setDoctorSchedule;
const getAvailableSlots = async (req, res) => {
    try {
        const { doctorId: userId } = req.params;
        const { date } = req.query;
        if (!userId || !date)
            return res.status(400).json({ error: "Missing params" });
        const slots = await availability_service_1.availabilityService.generateDoctorSlots(userId, date);
        return res.status(200).json({ slots });
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to fetch slots" });
    }
};
exports.getAvailableSlots = getAvailableSlots;
//# sourceMappingURL=availabilityController.js.map