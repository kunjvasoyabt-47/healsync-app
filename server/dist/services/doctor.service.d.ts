import { DoctorFilters } from "../interfaces/doctorfilter";
import { ApptStatus } from "@prisma/client";
export declare const doctorService: {
    fetchAllDoctors: (filters: DoctorFilters) => Promise<{
        doctorProfile: {
            name: string;
            specialization: string;
            fees: number;
            experience: number | null;
            bio: string | null;
            city: string | null;
        } | null;
        id: string;
        email: string;
    }[]>;
    fetchDoctorById: (id: string) => Promise<{
        doctorProfile: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            specialization: string;
            fees: number;
            userId: string;
            registrationNumber: string;
            experience: number | null;
            qualifications: string | null;
            bio: string | null;
            imageUrl: string | null;
            city: string | null;
            state: string | null;
            country: string;
            address: string | null;
        } | null;
        id: string;
        email: string;
    }>;
    getDoctorAppointmentsService: (profileId: string) => Promise<({
        patient: {
            name: string;
            phone: string | null;
            imageUrl: string | null;
        };
    } & {
        date: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ApptStatus;
        timeSlot: string;
        reportUrl: string | null;
        reason: string | null;
        symptoms: string | null;
        notes: string | null;
        rejectionReason: string | null;
        doctorId: string;
        patientId: string;
    })[] | null>;
    /**
     * Updates an appointment status
     */
    updateAppointmentStatusService: (appointmentId: string, status: ApptStatus) => Promise<{
        date: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ApptStatus;
        timeSlot: string;
        reportUrl: string | null;
        reason: string | null;
        symptoms: string | null;
        notes: string | null;
        rejectionReason: string | null;
        doctorId: string;
        patientId: string;
    }>;
    getDoctorAnalytics: (userId: string) => Promise<{
        totalAppointments: number;
        statusDistribution: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.AppointmentGroupByOutputType, "status"[]> & {
            _count: {
                id: number;
            };
        })[];
        dayWise: Record<string, number>;
    }>;
};
//# sourceMappingURL=doctor.service.d.ts.map