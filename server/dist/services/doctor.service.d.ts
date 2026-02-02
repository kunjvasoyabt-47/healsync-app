export declare const doctorService: {
    /**
     * Business logic to fetch all users with the DOCTOR role
     * Includes their professional profile details
     */
    fetchAllDoctors: () => Promise<{
        doctorProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
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
    }[]>;
    /**
     * Business logic to fetch a specific doctor by their ID
     */
    fetchDoctorById: (id: string) => Promise<{
        doctorProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
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
};
//# sourceMappingURL=doctor.service.d.ts.map