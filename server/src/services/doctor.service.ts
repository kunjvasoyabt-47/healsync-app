import { ZodEnum } from "zod";
import { prisma } from "../config/db";
import { DoctorFilters } from "../interfaces/doctorfilter";
import { ApptStatus } from "@prisma/client";

export const doctorService = {
  fetchAllDoctors: async (filters: DoctorFilters) => {
    const { name, city, specialization } = filters;

    const where: any = {
      role: "DOCTOR",
    };

    if (name || city || specialization) {
      // If filters are present, apply them directly to the relation
      where.doctorProfile = {
        ...(name && { name: { contains: name, mode: 'insensitive' } }),
        ...(city && { city: { contains: city, mode: 'insensitive' } }),
        ...(specialization && { specialization: { contains: specialization, mode: 'insensitive' } }),
      };
    } else {
      // Default: Ensure profile exists
      where.doctorProfile = { isNot: null };
    }

    return await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        doctorProfile: {
          select: {
            name: true,
            specialization: true,
            city: true,
            fees: true,
            experience: true,
            bio: true,
          }
        },
      }
    });
  },

  fetchDoctorById: async (id: string) => {
    const doctor = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        doctorProfile: true 
      }
    });

    if (!doctor || !doctor.doctorProfile) {
      throw new Error("Doctor not found");
    }

    return doctor;
  },
getDoctorAppointmentsService: async (profileId: string) => {
  console.log("=== SERVICE CALLED ===");
  console.log("Looking for doctor with profileId:", profileId);
  
  const doctorProfile = await prisma.doctorProfile.findUnique({
    where: { id: profileId },
  });

  console.log("Database returned:", doctorProfile);

  if (!doctorProfile) {
    console.log("RETURNING NULL - DOCTOR NOT FOUND");
    return null;
  }

  const appointments = await prisma.appointment.findMany({
    where: { doctorId: profileId },
    include: {
      patient: {
        select: {
          name: true,
          phone: true,
          imageUrl: true,
        },
      },
    },
    orderBy: { date: 'asc' },
  });

  console.log("Found appointments count:", appointments.length);
  return appointments;
},
  /**
   * Updates an appointment status
   */
  updateAppointmentStatusService: async (appointmentId: string, status: ApptStatus) => {
    return await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
    });
  }
};