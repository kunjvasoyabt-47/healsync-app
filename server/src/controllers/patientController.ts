import { Request, Response } from "express";
import { prisma } from "../config/db";

// GET /api/patients/me
export const getMyProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        // We get 'userId' from the token (via the middleware we built)
        const userId = req.user.userId;

        const patient = await prisma.patientProfile.findUnique({
            where: { userId },
            include: { 
                user: { 
                    select: { email: true, role: true } 
                } 
            }
        });

        if (!patient) {
            res.status(404).json({ error: "Profile not found" });
            return;
        }

        res.json(patient);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch profile" });
    }
};

// PUT /api/patients/me
export const updateMyProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user.userId;
        const { name, phone, imageUrl } = req.body;

        const updatedPatient = await prisma.patientProfile.update({
            where: { userId },
            data: {
                name,
                phone,
                imageUrl
            }
        });

        res.json({ message: "Profile updated successfully", patient: updatedPatient });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update profile" });
    }
};
