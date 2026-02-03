export declare const authService: {
    /**
     * Handles User + Profile Creation in a single transaction
     */
    registerUser: (userData: any) => Promise<{
        id: string;
        email: string;
        password: string;
        role: import(".prisma/client").$Enums.Role;
        isVerified: boolean;
        tokenVersion: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    /**
     * Handles the logout process by revoking the specific refresh token
     */
    logout: (refreshToken: string) => Promise<boolean>;
    /**
     * Handles credentials validation and session management
     */
    loginUser: (credentials: any) => Promise<{
        accessToken: string;
        refreshToken: string;
        role: import(".prisma/client").$Enums.Role;
        profileId: string | undefined;
        userId: string;
    }>;
    /**
     * Handles Access Token rotation via Refresh Token
     */
    refreshSession: (token: string) => Promise<string>;
    /**
     * Revokes a session in the database
     */
    revokeToken: (token: string) => Promise<boolean>;
    /**
     * Generates a secure password reset token
     */
    generateResetToken: (email: string) => Promise<string>;
    /**
     * Resets the password using a valid token
     */
    resetPassword: (token: string, newPassword: string) => Promise<boolean>;
};
//# sourceMappingURL=auth.service.d.ts.map