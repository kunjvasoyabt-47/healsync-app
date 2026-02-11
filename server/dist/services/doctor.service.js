"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doctorService = void 0;
const db_1 = require("../config/db");
exports.doctorService = {
    fetchAllDoctors: async (filters) => {
        const { name, city, specialization } = filters;
        const where = {
            role: "DOCTOR",
        };
        if (name || city || specialization) {
            // If filters are present, apply them directly to the relation
            where.doctorProfile = {
                ...(name && { name: { contains: name, mode: 'insensitive' } }),
                ...(city && { city: { contains: city, mode: 'insensitive' } }),
                ...(specialization && { specialization: { contains: specialization, mode: 'insensitive' } }),
            };
        }
        else {
            // Default: Ensure profile exists
            where.doctorProfile = { isNot: null };
        }
        return await db_1.prisma.user.findMany({
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
    fetchDoctorById: async (id) => {
        const doctor = await db_1.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                doctorProfile: true,
            }
        });
        if (!doctor || !doctor.doctorProfile) {
            throw new Error("Doctor not found");
        }
        return doctor;
    },
    // Add or update this function inside the doctorService object
    getDoctorAppointmentsService: async (profileId) => {
        // Check if doctor profile exists
        const doctorProfile = await db_1.prisma.doctorProfile.findUnique({
            where: { id: profileId },
        });
        if (!doctorProfile) {
            return null; // Return null if not found
        }
        // Fetch appointments
        return await db_1.prisma.appointment.findMany({
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
            // Top-level fields like 'reason' and 'reportUrl' are included by default
            orderBy: { date: 'asc' },
        });
    },
    /**
     * Updates an appointment status
     */
    updateAppointmentStatusService: async (appointmentId, status) => {
        return await db_1.prisma.appointment.update({
            where: { id: appointmentId },
            data: { status },
        });
    },
    getDoctorAnalytics: async (userId) => {
        // Fetch the doctor profile associated with the user
        const doctor = await db_1.prisma.doctorProfile.findUnique({
            where: { userId },
            select: { id: true }
        });
        if (!doctor)
            throw new Error("Doctor profile not found");
        // Execute queries in parallel for efficiency
        const [statusGroups, allAppointments] = await Promise.all([
            // 1. Data for Status Donut Chart
            db_1.prisma.appointment.groupBy({
                by: ['status'],
                where: { doctorId: doctor.id },
                _count: { id: true }
            }),
            // 2. Data for Weekly Bar Chart
            db_1.prisma.appointment.findMany({
                where: { doctorId: doctor.id },
                select: { createdAt: true }
            })
        ]);
        // Format Day-wise data (e.g., { "Monday": 5, "Tuesday": 3 })
        const dayWise = allAppointments.reduce((acc, curr) => {
            const day = new Date(curr.createdAt).toLocaleDateString('en-US', { weekday: 'long' });
            acc[day] = (acc[day] || 0) + 1;
            return acc;
        }, {});
        return {
            totalAppointments: allAppointments.length,
            statusDistribution: statusGroups,
            dayWise
        };
    }
};
//# sourceMappingURL=doctor.service.js.map