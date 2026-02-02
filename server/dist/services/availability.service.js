"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.availabilityService = void 0;
const db_1 = require("../config/db");
const date_fns_1 = require("date-fns");
exports.availabilityService = {
    generateDoctorSlots: async (doctorId, dateStr) => {
        const selectedDate = new Date(dateStr);
        const dayOfWeek = selectedDate.getDay();
        // Debugging: Check what is being queried
        console.log(`Querying DB for Doctor: ${doctorId} on Day: ${dayOfWeek}`);
        // 1. Fetch from the Availability table
        const schedule = await db_1.prisma.availability.findUnique({
            where: {
                // This MUST match the @@unique index in your schema.prisma
                doctorId_dayOfWeek: {
                    doctorId: doctorId,
                    dayOfWeek: dayOfWeek,
                },
            },
        });
        if (!schedule || !schedule.isBookable) {
            console.log("No bookable schedule found.");
            return [];
        }
        // 2. Fetch existing appointments to hide booked slots
        const booked = await db_1.prisma.appointment.findMany({
            where: {
                doctorId,
                date: selectedDate,
                status: { in: ["PENDING", "APPROVED_UNPAID", "PAID"] }
            },
            select: { timeSlot: true }
        });
        const takenSlots = booked.map(a => a.timeSlot);
        // 3. Generate 30-min intervals
        const availableSlots = [];
        const [startH, startM] = schedule.startTime.split(':').map(Number);
        const [endH, endM] = schedule.endTime.split(':').map(Number);
        let current = new Date(selectedDate);
        current.setHours(startH, startM, 0, 0);
        const end = new Date(selectedDate);
        end.setHours(endH, endM, 0, 0);
        while (current < end) {
            const slotStr = (0, date_fns_1.format)(current, "HH:mm");
            if (!takenSlots.includes(slotStr)) {
                availableSlots.push(slotStr);
            }
            current = (0, date_fns_1.addMinutes)(current, schedule.slotDuration);
        }
        return availableSlots;
    }
};
//# sourceMappingURL=availability.service.js.map