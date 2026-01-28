import { Request, Response } from "express";
import { authService } from "../services/auth.service";

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, role, name } = req.body;
        if (!email || !password || !role || !name) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const user = await authService.registerUser(req.body);
        res.status(201).json({ message: "Registered successfully", userId: user.id });
    } catch (error: any) {
        res.status(400).json({ error: error.message || "Server Error" });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { accessToken, refreshToken, role, profileId } = await authService.loginUser(req.body);

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000 
        });

        res.json({ message: "Logged in", refreshToken, role, profileId });
    } catch (error: any) {
        res.status(401).json({ error: error.message || "Server Error" });
    }
};

export const refresh = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(401).json({ error: "No refresh token" });

        const newAccessToken = await authService.refreshSession(refreshToken);

        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000 
        });

        res.json({ message: "Token refreshed" });
    } catch (error: any) {
        res.status(403).json({ error: error.message });
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(400).json({ error: "Refresh token is required" });

        await authService.revokeToken(refreshToken);

        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        res.json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ error: "Logout failed" });
    }
};