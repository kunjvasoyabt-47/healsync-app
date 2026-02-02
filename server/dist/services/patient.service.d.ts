export declare const patientService: {
    /**
     * Business logic to fetch a patient's profile using the userId from JWT.
     * Includes basic user info like email and role.
     */
    fetchProfile: (userId: string) => Promise<{
        user: {
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        phone: string | null;
        userId: string;
        imageUrl: string | null;
    }>;
    /**
     * Business logic to update patient details.
     */
    updateProfile: (userId: string, updateData: any) => Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        phone: string | null;
        userId: string;
        imageUrl: string | null;
    }>;
};
//# sourceMappingURL=patient.service.d.ts.map