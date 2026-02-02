"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAppointment = void 0;
const db_1 = require("../config/db");
const createAppointment = async (req, res) => {
    try {
        const { doctorId, date, timeSlot, reason } = req.body;
        // 1. Get Patient ID from the verified token (req.user)
        const patientId = req.user.profileId;
        // 2. CONCURRENCY CHECK: Ensure no one else booked this while the user was thinking
        const existing = await db_1.prisma.appointment.findUnique({
            where: {
                doctorId_date_timeSlot: {
                    doctorId,
                    date: new Date(date),
                    timeSlot
                }
            }
        });
        if (existing) {
            return res.status(400).json({ error: "This slot was just taken. Please pick another." });
        }
        // 3. Create the record
        const appointment = await db_1.prisma.appointment.create({
            data: {
                doctorId,
                patientId,
                date: new Date(date),
                timeSlot,
                reason,
                status: "PENDING"
            }
        });
        res.status(201).json({ message: "Appointment requested successfully", appointment });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error during booking" });
    }
};
exports.createAppointment = createAppointment;
//# sourceMappingURL=appointmentController.js.map