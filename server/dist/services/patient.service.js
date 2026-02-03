"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patientService = void 0;
const db_1 = require("../config/db");
exports.patientService = {
    /**
     * Business logic to fetch a patient's profile using the userId from JWT.
     * Includes basic user info like email and role.
     */
    fetchProfile: async (userId) => {
        const patient = await db_1.prisma.patientProfile.findUnique({
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
    updateProfile: async (userId, updateData) => {
        return await db_1.prisma.patientProfile.update({
            where: { userId },
            data: {
                name: updateData.name,
                phone: updateData.phone,
                imageUrl: updateData.imageUrl
            }
        });
    }
};
//# sourceMappingURL=patient.service.js.map