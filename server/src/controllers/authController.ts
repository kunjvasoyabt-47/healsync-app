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

export const logout =async (req: Request, res: Response) => {
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