"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.availabilityService = void 0;
const db_1 = require("../config/db");
const date_fns_1 = require("date-fns");
exports.availabilityService = {
    generateDoctorSlots: async (userIdFromUrl, dateStr) => {
        // 🟢 FIX: Parse the date string directly (YYYY-MM-DD). 
        // This treats the date as "Local" to the environment, preventing UTC shifts
        const selectedDate = new Date(dateStr);
        // 🟢 FIX: Use .getDay() instead of .getUTCDay()
        const dayOfWeek = selectedDate.getDay();
        const profile = await db_1.prisma.doctorProfile.findUnique({
            where: { userId: userIdFromUrl },
            select: { id: true }
        });
        if (!profile)
            return [];
        const doctorProfileId = profile.id;
        // Inside generateDoctorSlots
        const schedule = await db_1.prisma.availability.findFirst({
            where: {
                doctorId: doctorProfileId,
                dayOfWeek: dayOfWeek,
                isBookable: true,
            },
        });
        if (!schedule || !schedule.isBookable)
            return [];
        const booked = await db_1.prisma.appointment.findMany({
            where: {
                doctorId: doctorProfileId,
                // 🟢 Ensure we match the exact date regardless of time stored in DB
                date: {
                    gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
                    lt: new Date(selectedDate.setHours(23, 59, 59, 999)),
                },
                status: { in: ["PENDING", "APPROVED_UNPAID", "PAID"] }
            },
            select: { timeSlot: true }
        });
        const takenSlots = booked.map(a => a.timeSlot);
        const availableSlots = [];
        const [startH, startM] = schedule.startTime.split(':').map(Number);
        const [endH, endM] = schedule.endTime.split(':').map(Number);
        // 🟢 FIX: Use setHours (Local) instead of setUTCHours to stay consistent
        let current = new Date(selectedDate);
        current.setHours(startH, startM, 0, 0);
        const end = new Date(selectedDate);
        end.setHours(endH, endM, 0, 0);
        while (current < end) {
            // 🟢 FIX: Extract local hours and minutes
            const hh = String(current.getHours()).padStart(2, '0');
            const mm = String(current.getMinutes()).padStart(2, '0');
            const slotStr = `${hh}:${mm}`;
            if (!takenSlots.includes(slotStr)) {
                availableSlots.push(slotStr);
            }
            current = (0, date_fns_1.addMinutes)(current, schedule.slotDuration);
        }
        return availableSlots;
    }
};
//# sourceMappingURL=availability.service.js.map