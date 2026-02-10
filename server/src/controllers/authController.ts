import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { registerSchema } from "../validations/auth.validation";

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

    try{
    // Logic for login (You can create a separate loginSchema for this)
    const result = await authService.loginUser(req.body);

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
}catch(err:any){
    res.status(401).json({ message: err.message || "Unauthorized" });
}
};

export const logout = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    // 1. Call the service logic to revoke the token in DB
    await authService.logout(refreshToken);

    // 2. Clear the HttpOnly cookie from the browser
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
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
            // 🟢 The email is now sent INSIDE this service function
            await authService.generateResetToken(email);
            
        } catch (err: any) {
            // ✅ Security: Don't reveal if email exists or not
            if (err.message === "No account found with this email") {
                console.log(`Password reset attempted for non-existent email: ${email}`);
                // We do nothing here, just proceed to the 200 OK below
            } else {
                throw err; // Re-throw actual system/email errors
            }
        }

        // ✅ Always return success to prevent email enumeration attacks
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
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Extract userId from the request (attached by your middleware)
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized: No user ID found" });
      return;
    }

    // 2. Call the service to get user data
    const user = await authService.fetchMe(userId);

    // 3. Return user data to frontend
    res.status(200).json({ user });
  } catch (error: any) {
    // 4. Handle errors (like User not found or DB issues)
    if (error.message === "User not found") {
      res.status(404).json({ message: error.message });
    } else {
      console.error("GetMe Controller Error:", error);
      res.status(500).json({ message: "Failed to get user data" });
    }
  }
};
/**
 * Controller to handle automatic token rotation
 */
export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) return res.status(401).json({ error: "No refresh token provided" });

    const newAccessToken = await authService.refreshSession(refreshToken); 

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true, // Required for sameSite: "none"
      sameSite: "none", 
      path: "/", // 🟢 Critical: Ensures cookie is available to all routes
      maxAge: 30 * 60 * 1000 
    });

    return res.status(200).json({ message: "Token refreshed" });
  } catch (err: any) {
    console.error("Refresh Error:", err.message);
    return res.status(401).json({ error: "Invalid or expired session" });
  }
};
export const updateProfile = async (req: Request, res: Response) => {
  try {
    // 1. Extract identity from the 'verifyToken' middleware
    const userId = (req as any).user?.userId;
    const role = (req as any).user?.role;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No user found" });
    }

    let updatedProfile;

    // 2. Branch logic based on user role
    if (role === "DOCTOR") {
      updatedProfile = await authService.updateDoctorProfile(userId, req.body);
    } else if (role === "PATIENT") {
      updatedProfile = await authService.updatePatientProfile(userId, req.body);
    } else {
      return res.status(400).json({ message: "Invalid user role" });
    }

    // 3. Success Response
    return res.status(200).json({
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
    
  } catch (error: any) {
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