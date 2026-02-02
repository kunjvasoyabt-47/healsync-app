"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doctorService = void 0;
const db_1 = require("../config/db");
exports.doctorService = {
    /**
     * Business logic to fetch all users with the DOCTOR role
     * Includes their professional profile details
     */
    fetchAllDoctors: async () => {
        return await db_1.prisma.user.findMany({
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
    fetchDoctorById: async (id) => {
        const doctor = await db_1.prisma.user.findUnique({
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
//# sourceMappingURL=doctor.service.js.map