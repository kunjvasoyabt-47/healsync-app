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
        console.error(error);
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

        const accessToken = jwt.sign(
            { userId: user.id, role: user.role, profileId, version: user.tokenVersion },
            process.env.JWT_SECRET!,
            { expiresIn: "15m" }
        );

        const refreshToken = uuidv4();
        await prisma.refreshToken.create({
            data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({ message: "Logged in", accessToken, role: user.role, profileId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server Error" });
    }
};