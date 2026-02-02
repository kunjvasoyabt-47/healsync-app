import { prisma } from "../config/db";
import { DoctorFilters } from "../interfaces/doctorfilter";

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
  }
};