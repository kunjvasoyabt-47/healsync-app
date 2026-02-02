    import { Request, Response } from "express";
    import { prisma } from "../config/db";
    import { availabilityService } from "../services/availability.service";

   export const setDoctorSchedule = async (req: Request, res: Response) => {
  try {
    const { doctorId: userId } = req.params; 
    const { dayOfWeek, startTime, endTime, slotDuration, isBookable } = req.body;

    // Log the userId to make sure it's reaching the server
    console.log("Setting schedule for User ID:", userId);

    const profile = await prisma.doctorProfile.findUnique({ where: { userId } });
    
    if (!profile) {
      console.error("No DoctorProfile found for this User ID");
      return res.status(404).json({ error: "Doctor profile not found" });
    }

    const updatedSchedule = await prisma.availability.upsert({
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
    } catch (error) {
        // THIS LINE WILL TELL YOU THE EXACT PRISMA ERROR IN YOUR TERMINAL
        console.error("DETAILED DATABASE ERROR:", error); 
        return res.status(500).json({ error: "Internal Server Error" });
    }
    };

    export const getAvailableSlots = async (req: Request, res: Response) => {
    try {
        const { doctorId: userId } = req.params;
        const { date } = req.query;

        if (!userId || !date) return res.status(400).json({ error: "Missing params" });

        const slots = await availabilityService.generateDoctorSlots(userId, date as string);
        return res.status(200).json({ slots });
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch slots" });
    }
    };