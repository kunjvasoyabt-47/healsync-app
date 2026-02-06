import { prisma } from "../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto"; // Required for secure reset tokens

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
     * Handles the logout process by revoking the specific refresh token
     */
    logout: async (refreshToken: string) => {
    if (!refreshToken) throw new Error("Refresh token is required");
    
    const result = await prisma.refreshToken.updateMany({
        where: { 
            token: refreshToken.trim(),
            revoked: false 
        },
        data: { revoked: true },
    });

    // 🟢 CHANGED: Instead of throwing an error, just log it.
    if (result.count === 0) {
        console.warn("Logout: Token was already revoked or didn't exist.");
    }
    
    // Always return true because the end result (no active session) is met
    return true;
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
    },

    /**
     * Generates a secure password reset token
     */
   generateResetToken: async (email: string) => {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new Error("No account found with this email");

        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); //  10 minutes

        // Delete any existing unused tokens for this user
        await prisma.passwordResetToken.deleteMany({ 
            where: { userId: user.id } 
        });

        // Create new token
        await prisma.passwordResetToken.create({
            data: {
                token: hashedToken,
                expiresAt,
                userId: user.id
            }
        });

        return resetToken; // Return UNHASHED token for URL
    },
    /**
     * Resets the password using a valid token
     */
 resetPassword: async (token: string, newPassword: string) => {
    // 1. Trim the token to remove any hidden spaces or newlines from the URL
    const cleanToken = token.trim(); 
    const hashedToken = crypto.createHash("sha256").update(cleanToken).digest("hex");

    const tokenData = await prisma.passwordResetToken.findUnique({
        where: { token: hashedToken },
        include: { user: true }
    });

    // 2. Add specific logging to catch the exact cause of failure
    if (!tokenData) {
        console.error("Reset Error: Token hash not found in database.");
        throw new Error("Invalid or expired reset token");
    }
    
    if (tokenData.used) {
        console.error("Reset Error: Token has already been used.");
        throw new Error("Invalid or expired reset token");
    }

    if (tokenData.expiresAt < new Date()) {
        console.error(`Reset Error: Token expired at ${tokenData.expiresAt}. Current time: ${new Date()}`);
        throw new Error("Invalid or expired reset token");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Keep your existing transaction logic exactly as it is
    await prisma.$transaction([
        prisma.user.update({
            where: { id: tokenData.userId },
            data: { 
                password: hashedPassword,
                tokenVersion: { increment: 1 }
            }
        }),
        prisma.passwordResetToken.update({
            where: { id: tokenData.id },
            data: { used: true }
        }),
        prisma.refreshToken.deleteMany({
            where: { userId: tokenData.userId }
        })
    ]);

    return true;
    },
   fetchMe: async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        doctorProfile: {
          select: {
            id: true,
            name: true,
            specialization: true,
          }
        },
        patientProfile: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  },
};