"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const db_1 = require("../config/db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const crypto_1 = __importDefault(require("crypto")); // Required for secure reset tokens
exports.authService = {
    /**
     * Handles User + Profile Creation in a single transaction
     */
    registerUser: async (userData) => {
        const { email, password, role, name, specialization, fees, phone } = userData;
        const existingUser = await db_1.prisma.user.findUnique({ where: { email } });
        if (existingUser)
            throw new Error("User already exists");
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        return await db_1.prisma.$transaction(async (tx) => {
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
            }
            else if (role === "PATIENT") {
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
    logout: async (refreshToken) => {
        if (!refreshToken)
            throw new Error("Refresh token is required");
        const result = await db_1.prisma.refreshToken.updateMany({
            where: {
                token: refreshToken.trim(),
                revoked: false
            },
            data: { revoked: true },
        });
        if (result.count === 0)
            throw new Error("Session not found or already revoked");
        return true;
    },
    /**
     * Handles credentials validation and session management
     */
    loginUser: async (credentials) => {
        const { email, password } = credentials;
        const user = await db_1.prisma.user.findUnique({
            where: { email },
            include: { doctorProfile: true, patientProfile: true }
        });
        if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
            throw new Error("Invalid credentials");
        }
        const profileId = user.role === "DOCTOR" ? user.doctorProfile?.id : user.patientProfile?.id;
        // Revoke previous sessions (Single Device Logic)
        await db_1.prisma.refreshToken.updateMany({
            where: { userId: user.id, revoked: false },
            data: { revoked: true }
        });
        const accessToken = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role, profileId, version: user.tokenVersion }, process.env.JWT_SECRET, { expiresIn: "15m" });
        const refreshToken = (0, uuid_1.v4)();
        await db_1.prisma.refreshToken.create({
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
    refreshSession: async (token) => {
        const savedToken = await db_1.prisma.refreshToken.findUnique({
            where: { token: token.trim() },
            include: { user: { include: { doctorProfile: true, patientProfile: true } } }
        });
        if (!savedToken || savedToken.revoked || savedToken.expiresAt < new Date()) {
            throw new Error("Invalid or expired session");
        }
        const user = savedToken.user;
        const profileId = user.role === "DOCTOR" ? user.doctorProfile?.id : user.patientProfile?.id;
        return jsonwebtoken_1.default.sign({ userId: user.id, role: user.role, profileId, version: user.tokenVersion }, process.env.JWT_SECRET, { expiresIn: "15m" });
    },
    /**
     * Revokes a session in the database
     */
    revokeToken: async (token) => {
        const result = await db_1.prisma.refreshToken.updateMany({
            where: { token: token.trim() },
            data: { revoked: true },
        });
        return result.count > 0;
    },
    /**
     * Generates a secure password reset token
     */
    generateResetToken: async (email) => {
        const user = await db_1.prisma.user.findUnique({ where: { email } });
        if (!user)
            throw new Error("No account found with this email");
        const resetToken = crypto_1.default.randomBytes(32).toString("hex");
        const hashedToken = crypto_1.default.createHash("sha256").update(resetToken).digest("hex");
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); //  10 minutes
        // Delete any existing unused tokens for this user
        await db_1.prisma.passwordResetToken.deleteMany({
            where: { userId: user.id }
        });
        // Create new token
        await db_1.prisma.passwordResetToken.create({
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
    resetPassword: async (token, newPassword) => {
        const hashedToken = crypto_1.default.createHash("sha256").update(token).digest("hex");
        const tokenData = await db_1.prisma.passwordResetToken.findUnique({
            where: { token: hashedToken },
            include: { user: true }
        });
        // ✅ Check if token exists, is not used, and not expired
        if (!tokenData || tokenData.used || tokenData.expiresAt < new Date()) {
            throw new Error("Invalid or expired reset token");
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        // ✅ Update password and mark token as used (not delete)
        await db_1.prisma.$transaction([
            db_1.prisma.user.update({
                where: { id: tokenData.userId },
                data: {
                    password: hashedPassword,
                    tokenVersion: { increment: 1 } // ✅ Invalidate all sessions
                }
            }),
            db_1.prisma.passwordResetToken.update({
                where: { id: tokenData.id },
                data: { used: true }
            }),
            // ✅ Delete all refresh tokens (logout from all devices)
            db_1.prisma.refreshToken.deleteMany({
                where: { userId: tokenData.userId }
            })
        ]);
        return true;
    }
};
//# sourceMappingURL=auth.service.js.map