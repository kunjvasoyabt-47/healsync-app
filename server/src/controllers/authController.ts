import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { registerSchema } from "../validations/auth.validation";
import { sendEmail } from "../utils/email";

export const register = async (req: Request, res: Response) => {
  // 1. Validate data (This triggers your superRefine logic)
  const validatedData = registerSchema.parse(req.body);

  // 2. Call service with clean data
  const user = await authService.registerUser(validatedData);

  res.status(201).json({
    status: "success",
    message: "Registration successful",
    data: { userId: user.id }
  });
};

export const login = async (req: Request, res: Response) => {
  // Logic for login (You can create a separate loginSchema for this)
  const result = await authService.loginUser(req.body);

    // 2. Set the cookie using 'accessToken' (NOT 'token')
    res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000 // 15 minutes
    });

    // 3. Return the 'refreshToken' (NOT 'token') to the frontend
    res.status(200).json({
        message: "Login successful",
        refreshToken: result.refreshToken, 
        role: result.role,
        profileId: result.profileId
    });
};

export const logout = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    // 1. Call the service logic to revoke the token in DB
    await authService.logout(refreshToken);

    // 2. Clear the HttpOnly cookie from the browser
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });

    res.status(200).json({ message: "Logged out successfully" });
};

/**
 * NEW: Handles the forgot password request
 */
export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
        try {
            const resetToken = await authService.generateResetToken(email);
            
            const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

            await sendEmail({
                email: email,
                subject: "HealSync - Password Reset Request",
                message: resetUrl,
            });
        } catch (err: any) {
            // ✅ Don't reveal if email exists or not (security)
            if (err.message === "No account found with this email") {
                console.log(`Password reset attempted for non-existent email: ${email}`);
                // Continue to send success response anyway
            } else {
                throw err; // Re-throw other errors
            }
        }

        // ✅ Always return success to prevent email enumeration
        res.status(200).json({
            message: "If an account exists with this email, a password reset link has been sent."
        });
    } catch (err) {
        console.error("Forgot Password Error:", err); 
        res.status(500).json({ message: "Internal server error." });
    }
};

/**
 * NEW: Handles the actual password update
 */
export const resetPassword = async (req: Request, res: Response) => {
    const { token, password } = req.body;

    try {
        await authService.resetPassword(token, password);

        res.status(200).json({
            success: true,
            message: "Password has been successfully updated. Please login with your new password."
        });
    } catch (err: any) {
        console.error("Reset Password Error:", err);
        
        // ✅ Return specific error for invalid/expired tokens
        if (err.message === "Invalid or expired reset token") {
            return res.status(400).json({ 
                success: false,
                message: "This password reset link is invalid or has expired. Please request a new one."
            });
        }
        
        res.status(500).json({ 
            success: false,
            message: "Internal server error." 
        });
    }
};