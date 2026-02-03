"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.logout = exports.login = exports.register = void 0;
const auth_service_1 = require("../services/auth.service");
const auth_validation_1 = require("../validations/auth.validation");
const email_1 = require("../utils/email");
const register = async (req, res) => {
    // 1. Validate data (This triggers your superRefine logic)
    const validatedData = auth_validation_1.registerSchema.parse(req.body);
    // 2. Call service with clean data
    const user = await auth_service_1.authService.registerUser(validatedData);
    res.status(201).json({
        status: "success",
        message: "Registration successful",
        data: { userId: user.id }
    });
};
exports.register = register;
const login = async (req, res) => {
    // Logic for login (You can create a separate loginSchema for this)
    const result = await auth_service_1.authService.loginUser(req.body);
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
exports.login = login;
const logout = async (req, res) => {
    const { refreshToken } = req.body;
    // 1. Call the service logic to revoke the token in DB
    await auth_service_1.authService.logout(refreshToken);
    // 2. Clear the HttpOnly cookie from the browser
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    res.status(200).json({ message: "Logged out successfully" });
};
exports.logout = logout;
/**
 * NEW: Handles the forgot password request
 */
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        try {
            const resetToken = await auth_service_1.authService.generateResetToken(email);
            const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
            await (0, email_1.sendEmail)({
                email: email,
                subject: "HealSync - Password Reset Request",
                message: resetUrl,
            });
        }
        catch (err) {
            // ✅ Don't reveal if email exists or not (security)
            if (err.message === "No account found with this email") {
                console.log(`Password reset attempted for non-existent email: ${email}`);
                // Continue to send success response anyway
            }
            else {
                throw err; // Re-throw other errors
            }
        }
        // ✅ Always return success to prevent email enumeration
        res.status(200).json({
            message: "If an account exists with this email, a password reset link has been sent."
        });
    }
    catch (err) {
        console.error("Forgot Password Error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
};
exports.forgotPassword = forgotPassword;
/**
 * NEW: Handles the actual password update
 */
const resetPassword = async (req, res) => {
    const { token, password } = req.body;
    try {
        await auth_service_1.authService.resetPassword(token, password);
        res.status(200).json({
            success: true,
            message: "Password has been successfully updated. Please login with your new password."
        });
    }
    catch (err) {
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
exports.resetPassword = resetPassword;
//# sourceMappingURL=authController.js.map