import { prisma } from "../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto"; // Required for secure reset tokens
import { sendEmail } from "../utils/email";

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
       // Revoke previous sessions (Single Device Logic)
        const revokedCount = await prisma.refreshToken.updateMany({
            where: { userId: user.id, revoked: false },
            data: { revoked: true }
        });
        console.log(`🔄 Revoked ${revokedCount.count} previous sessions for user: ${email}`);

        const accessToken = jwt.sign(
            { userId: user.id, role: user.role, profileId, version: user.tokenVersion },
            process.env.JWT_SECRET!,
            { expiresIn: "30m" }
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
    /**
 * Handles Access Token rotation via Refresh Token
 */
refreshSession: async (token: string) => {
  const savedToken = await prisma.refreshToken.findUnique({
    where: { token: token.trim() },
    include: { user: { include: { doctorProfile: true, patientProfile: true } } }
  });

  // 🟢 More specific error messages for debugging
  if (!savedToken) {
    console.error("❌ Refresh Service: Token not found in DB");
    throw new Error("Invalid or expired session");
  }

  // 🟢 CRITICAL: Explicitly check for revoked tokens (single device login)
  if (savedToken.revoked) {
    console.error("❌ Refresh Service: Token was revoked (logged in on another device)");
    throw new Error("Invalid or expired session");
  }

  if (savedToken.expiresAt < new Date()) {
    console.error("❌ Refresh Service: Token expired naturally");
    throw new Error("Invalid or expired session");
  }

  const user = savedToken.user;
  const profileId = user.role === "DOCTOR" ? user.doctorProfile?.id : user.patientProfile?.id;

  console.log("✅ Refresh Service: Token validated, generating new access token");

  // Generate new access token
  return jwt.sign(
    { userId: user.id, role: user.role, profileId, version: user.tokenVersion },
    process.env.JWT_SECRET!,
    { expiresIn: "30m" }
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
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await prisma.passwordResetToken.deleteMany({ 
            where: { userId: user.id } 
        });

        await prisma.passwordResetToken.create({
            data: {
                token: hashedToken,
                expiresAt,
                userId: user.id
            }
        });

        // 🟢 NEW: Construct the Reset Link and send the Email
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        try {
            await sendEmail({
                email: user.email,
                subject: "HealSync: Password Reset Request",
                message: `
                  <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #4CAF50;">Reset Your Password</h2>
                    <p>You requested a password reset for your HealSync account. Click the button below to set a new password:</p>
                    <a href="${resetLink}" style="
                      display: inline-block;
                      padding: 12px 24px;
                      background-color: #4CAF50;
                      color: white;
                      text-decoration: none;
                      border-radius: 5px;
                      font-weight: bold;
                    ">Reset Password</a>
                    <p style="margin-top: 20px; font-size: 12px; color: #666;">
                      This link will expire in 10 minutes. If you did not request this, please ignore this email.
                    </p>
                  </div>
                `,
            });
            console.log(`✅ Reset email sent to ${user.email}`);
        } catch (error) {
            console.error("❌ Failed to send reset email:", error);
            // We don't necessarily want to crash the whole process if email fails, 
            // but for a password reset, it's usually better to throw so the user knows.
            throw new Error("Could not send reset email. Please try again later.");
        }

        return resetToken; 
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
  updatePatientProfile: async (userId: string, data: any) => {
        return await prisma.patientProfile.update({
            where: { userId },
            data: {
                name: data.name,
                phone: data.phone,
            }
        });
    },

    updateDoctorProfile: async (userId: string, data: any) => {
        return await prisma.doctorProfile.update({
            where: { userId },
            data: {
                name: data.name,
                specialization: data.specialization,
                bio: data.bio,
                fees: data.fees ? Number(data.fees) : undefined,
                experience: data.experience ? Number(data.experience) : undefined,
                address: data.clinicAddress || data.clinicAddress,
            }
        });
    }
};