"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.refresh = exports.getMe = exports.resetPassword = exports.forgotPassword = exports.logout = exports.login = exports.register = void 0;
const auth_service_1 = require("../services/auth.service");
const auth_validation_1 = require("../validations/auth.validation");
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
    try {
        // Logic for login (You can create a separate loginSchema for this)
        const result = await auth_service_1.authService.loginUser(req.body);
        // 2. Set the cookie using 'accessToken' (NOT 'token')
        res.cookie("accessToken", result.accessToken, {
            httpOnly: true,
            //secure: process.env.NODE_ENV === "production",
            path: "/", // 🟢 Critical: Ensures cookie is available to all routes
            sameSite: "none",
            secure: true,
            maxAge: 30 * 60 * 1000 // 30 minutes
        });
        // 3. Return the 'refreshToken' (NOT 'token') to the frontend
        res.status(200).json({
            message: "Login successful",
            refreshToken: result.refreshToken,
            role: result.role,
            profileId: result.profileId
        });
    }
    catch (err) {
        res.status(401).json({ message: err.message || "Unauthorized" });
    }
};
exports.login = login;
const logout = async (req, res) => {
    const { refreshToken } = req.body;
    // 1. Call the service logic to revoke the token in DB
    await auth_service_1.authService.logout(refreshToken);
    // 2. Clear the HttpOnly cookie from the browser
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
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
            // 🟢 The email is now sent INSIDE this service function
            await auth_service_1.authService.generateResetToken(email);
        }
        catch (err) {
            // ✅ Security: Don't reveal if email exists or not
            if (err.message === "No account found with this email") {
                console.log(`Password reset attempted for non-existent email: ${email}`);
                // We do nothing here, just proceed to the 200 OK below
            }
            else {
                throw err; // Re-throw actual system/email errors
            }
        }
        // ✅ Always return success to prevent email enumeration attacks
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
const getMe = async (req, res) => {
    try {
        // 1. Extract userId from the request (attached by your middleware)
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized: No user ID found" });
            return;
        }
        // 2. Call the service to get user data
        const user = await auth_service_1.authService.fetchMe(userId);
        // 3. Return user data to frontend
        res.status(200).json({ user });
    }
    catch (error) {
        // 4. Handle errors (like User not found or DB issues)
        if (error.message === "User not found") {
            res.status(404).json({ message: error.message });
        }
        else {
            console.error("GetMe Controller Error:", error);
            res.status(500).json({ message: "Failed to get user data" });
        }
    }
};
exports.getMe = getMe;
/**
 * Controller to handle automatic token rotation
 */
const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken)
            return res.status(401).json({ error: "No refresh token provided" });
        const newAccessToken = await auth_service_1.authService.refreshSession(refreshToken);
        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: true, // Required for sameSite: "none"
            sameSite: "none",
            path: "/", // Critical: Ensures cookie is available to all routes
            maxAge: 30 * 60 * 1000
        });
        return res.status(200).json({ message: "Token refreshed" });
    }
    catch (err) {
        console.error("Refresh Error:", err.message);
        return res.status(401).json({ error: "Invalid or expired session" });
    }
};
exports.refresh = refresh;
const updateProfile = async (req, res) => {
    try {
        // 1. Extract identity from the 'verifyToken' middleware
        const userId = req.user?.userId;
        const role = req.user?.role;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: No user found" });
        }
        let updatedProfile;
        // 2. Branch logic based on user role
        if (role === "DOCTOR") {
            updatedProfile = await auth_service_1.authService.updateDoctorProfile(userId, req.body);
        }
        else if (role === "PATIENT") {
            updatedProfile = await auth_service_1.authService.updatePatientProfile(userId, req.body);
        }
        else {
            return res.status(400).json({ message: "Invalid user role" });
        }
        // 3. Success Response
        return res.status(200).json({
            message: "Profile updated successfully",
            profile: updatedProfile,
        });
    }
    catch (error) {
        // Handle Prisma errors (like record not found)
        if (error.code === "P2025") {
            return res.status(404).json({ message: "Profile record not found" });
        }
        console.error("Update Profile Error:", error);
        return res.status(500).json({
            message: "Internal server error during profile update"
        });
    }
};
exports.updateProfile = updateProfile;
//# sourceMappingURL=authController.js.map