import { Request, Response } from "express";
import { prisma } from "../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

// --- REGISTER ---
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, role, name, specialization, fees, phone } = req.body;

        if (!email || !password || !role || !name) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ error: "User already exists" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await prisma.$transaction(async (tx) => {
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

        res.status(201).json({ message: "Registered successfully", userId: result.id });
    } catch (error: any) {
        console.error("🔴 Register Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

// --- LOGIN ---
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ 
            where: { email },
            include: { doctorProfile: true, patientProfile: true } 
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }

        const profileId = user.role === "DOCTOR" ? user.doctorProfile?.id : user.patientProfile?.id;

        // --- SINGLE DEVICE LOGIN LOGIC ---
        const revokedSessions = await prisma.refreshToken.updateMany({
            where: { 
                userId: user.id,
                revoked: false 
            },
            data: { revoked: true }
        });
        console.log(`🔹 Previous sessions revoked: ${revokedSessions.count}`);

        // Generate Tokens
        const accessToken = jwt.sign(
            { userId: user.id, role: user.role, profileId, version: user.tokenVersion },
            process.env.JWT_SECRET!,
            { expiresIn: "15m" }
        );

        const refreshToken = uuidv4();
        
        // Save the new session to Neon DB
        await prisma.refreshToken.create({
            data: { 
                token: refreshToken, 
                userId: user.id, 
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
            }
        });

        // Set Access Token in HttpOnly Cookie
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000 
        });

        // Send Refresh Token in JSON Body
        res.json({ 
            message: "Logged in", 
            refreshToken, 
            role: user.role, 
            profileId 
        });

    } catch (error) {
        console.error("🔴 Login Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

// --- REFRESH ---
export const refresh = async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken } = req.body; 

        if (!refreshToken) {
            res.status(401).json({ error: "No refresh token provided" });
            return;
        }

        const savedToken = await prisma.refreshToken.findUnique({
            where: { token: refreshToken.trim() },
            include: { user: { include: { doctorProfile: true, patientProfile: true } } }
        });

        if (!savedToken || savedToken.revoked || savedToken.expiresAt < new Date()) {
             res.status(403).json({ error: "Invalid or expired session. Please login again." });
             return;
        }

        const user = savedToken.user;
        const profileId = user.role === "DOCTOR" ? user.doctorProfile?.id : user.patientProfile?.id;

        const accessToken = jwt.sign(
            { userId: user.id, role: user.role, profileId, version: user.tokenVersion },
            process.env.JWT_SECRET!,
            { expiresIn: "15m" }
        );

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000 
        });

        res.json({ message: "Token refreshed" });

    } catch (error) {
        console.error("🔴 Refresh Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

// --- LOGOUT ---
export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken } = req.body;

        // 1. Validate existence of the token in the request
        if (!refreshToken) {
            res.status(400).json({ error: "Refresh token is required" });
            return;
        }

        const tokenString = refreshToken.trim();
        console.log(`🔹 Attempting to logout token: "${tokenString}"`);

        // 2. Perform the update in the DB
        // We use updateMany because 'token' is a string field, not the Primary Key (ID)
        const result = await prisma.refreshToken.updateMany({
            where: {
                token: tokenString,
            },
            data: {
                revoked: true,
            },
        });

        console.log(`🔹 Database rows affected: ${result.count}`);

        // 3. Clear the cookie with matching security options
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        // 4. Handle cases where the token wasn't found
        if (result.count === 0) {
            console.warn("⚠️ Logout: Token provided but not found in Database.");
            res.status(404).json({ message: "Logout processed, but session was not found" });
            return;
        }

        res.json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("🔴 Logout Error:", error);
        res.status(500).json({ error: "Logout failed due to server error" });
    }
};