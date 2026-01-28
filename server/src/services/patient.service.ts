import { prisma } from "../config/db";

export const patientService = {
  /**
   * Business logic to fetch a patient's profile using the userId from JWT.
   * Includes basic user info like email and role.
   */
  fetchProfile: async (userId: string) => {
    const patient = await prisma.patientProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: { email: true, role: true }
        }
      }
    });

    if (!patient) {
      throw new Error("Profile not found");
    }

    return patient;
  },

  /**
   * Business logic to update patient details.
   */
  updateProfile: async (userId: string, updateData: any) => {
    return await prisma.patientProfile.update({
      where: { userId },
      data: {
        name: updateData.name,
        phone: updateData.phone,
        imageUrl: updateData.imageUrl
      }
    });
  }
};