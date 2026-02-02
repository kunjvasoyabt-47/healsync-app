import { prisma } from "../config/db";
import { addMinutes, format } from "date-fns";

export const availabilityService = {
  generateDoctorSlots: async (userIdFromUrl: string, dateStr: string) => {
    // 1. Normalize date to UTC Midnight
    const selectedDate = new Date(`${dateStr}T00:00:00Z`);
    const dayOfWeek = selectedDate.getUTCDay(); 

    // 2. Lookup Profile ID using User ID
    const profile = await prisma.doctorProfile.findUnique({
      where: { userId: userIdFromUrl },
      select: { id: true }
    });

    if (!profile) return [];
    const doctorProfileId = profile.id;

    // 3. Get working hours
    const schedule = await prisma.availability.findUnique({
      where: {
        doctorId_dayOfWeek: { doctorId: doctorProfileId, dayOfWeek },
      },
    });

    if (!schedule || !schedule.isBookable) return [];

    // 4. Filter Booked Appointments
    const booked = await prisma.appointment.findMany({
      where: {
        doctorId: doctorProfileId,
        date: selectedDate,
        status: { in: ["PENDING", "APPROVED_UNPAID", "PAID"] }
      },
      select: { timeSlot: true }
    });
    
    const takenSlots = booked.map(a => a.timeSlot);

    // 5. Generate Time Intervals
    const availableSlots: string[] = [];
    const [startH, startM] = schedule.startTime.split(':').map(Number);
    const [endH, endM] = schedule.endTime.split(':').map(Number);

    let current = new Date(selectedDate);
    current.setUTCHours(startH, startM, 0, 0);
    const end = new Date(selectedDate);
    end.setUTCHours(endH, endM, 0, 0);

    while (current < end) {
        const hh = String(current.getUTCHours()).padStart(2, '0');
        const mm = String(current.getUTCMinutes()).padStart(2, '0');
        const slotStr = `${hh}:${mm}`;
      if (!takenSlots.includes(slotStr)) {
        availableSlots.push(slotStr);
      }
      current = addMinutes(current, schedule.slotDuration);
    }

    return availableSlots;
  }
};