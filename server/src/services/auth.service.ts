import { prisma } from "../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export const authService = {
    /**
     * Handles User + Profile Creation in a single transaction
     */
    registerUser: async (userData: any) => {
        const { email, password, role, name, specialization, fees, phone } = userData;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) throw new Error("User already exists");

        const hashedPassword = await bcrypt.hash(password, 10);

        return await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: { email, password: hashedPassword, role },
            });

            if (role === "DOCTOR") {
                await tx.doctorProfile.create({
                    data: {
                        userId: user.id,
                        name,
                        specialization: specialization || "General Physician",
                        registrationNumber: `REG-${Date.now()}`,
                        fees: fees ? Number(fees) : 5000,
                    },
                });
            } else if (role === "PATIENT") {
                await tx.patientProfile.create({
                    data: { userId: user.id, name, phone: phone || "" },
                });
            }
            return user;
        });
    },

    /**
     * Handles credentials validation and session management
     */
    loginUser: async (credentials: any) => {
        const { email, password } = credentials;

        const user = await prisma.user.findUnique({
            where: { email },
            include: { doctorProfile: true, patientProfile: true }
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new Error("Invalid credentials");
        }

        const profileId = user.role === "DOCTOR" ? user.doctorProfile?.id : user.patientProfile?.id;

        // Revoke previous sessions (Single Device Logic)
        await prisma.refreshToken.updateMany({
            where: { userId: user.id, revoked: false },
            data: { revoked: true }
        });

        const accessToken = jwt.sign(
            { userId: user.id, role: user.role, profileId, version: user.tokenVersion },
            process.env.JWT_SECRET!,
            { expiresIn: "15m" }
        );

        const refreshToken = uuidv4();
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        });

        return { accessToken, refreshToken, role: user.role, profileId, userId: user.id };
    },

    /**
     * Handles Access Token rotation via Refresh Token
     */
    refreshSession: async (token: string) => {
        const savedToken = await prisma.refreshToken.findUnique({
            where: { token: token.trim() },
            include: { user: { include: { doctorProfile: true, patientProfile: true } } }
        });

        if (!savedToken || savedToken.revoked || savedToken.expiresAt < new Date()) {
            throw new Error("Invalid or expired session");
        }

        const user = savedToken.user;
        const profileId = user.role === "DOCTOR" ? user.doctorProfile?.id : user.patientProfile?.id;

        return jwt.sign(
            { userId: user.id, role: user.role, profileId, version: user.tokenVersion },
            process.env.JWT_SECRET!,
            { expiresIn: "15m" }
        );
    },

    /**
     * Revokes a session in the database
     */
    revokeToken: async (token: string) => {
        const result = await prisma.refreshToken.updateMany({
            where: { token: token.trim() },
            data: { revoked: true },
        });
        return result.count > 0;
    }
};