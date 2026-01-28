import { prisma } from "../config/db";

export const doctorService = {
  /**
   * Business logic to fetch all users with the DOCTOR role
   * Includes their professional profile details
   */
  fetchAllDoctors: async () => {
    return await prisma.user.findMany({
      where: { role: "DOCTOR" },
      select: {
        id: true,
        email: true,
        doctorProfile: true, // Includes specialization, fees, etc.
      }
    });
  },

  /**
   * Business logic to fetch a specific doctor by their ID
   */
  fetchDoctorById: async (id: string) => {
    const doctor = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        doctorProfile: true
      }
    });

    if (!doctor || doctor.doctorProfile === null) {
      throw new Error("Doctor not found");
    }

    return doctor;
  }
};