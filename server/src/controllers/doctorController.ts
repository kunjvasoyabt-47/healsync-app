import { Request, Response } from "express";
import { prisma } from "../config/db";

// GET /api/doctors
export const getAllDoctors = async (req: Request, res: Response): Promise<void> => {
    try {
        // Find all users who are DOCTORS
        const doctors = await prisma.user.findMany({
            where: { role: "DOCTOR" },
            select: {
                id: true,
                email: true,
                doctorProfile: true, // Include the profile details (Name, Fees, etc)
            }
        });
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch doctors" });
    }
};

// GET /api/doctors/:id
export const getDoctorById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const doctor = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                doctorProfile: true
            }
        });
        
        if (!doctor) {
             res.status(404).json({ error: "Doctor not found" });
             return;
        }
        res.json(doctor);
    } catch (error) {
        res.status(500).json({ error: "Error fetching doctor details" });
    }
};