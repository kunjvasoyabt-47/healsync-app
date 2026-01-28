import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db";

declare global {
  namespace Express {
    interface Request {
      user?: any; 
    }
  }
}

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken;

    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

        // --- THE TOKEN VERSION CHECK ---
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { tokenVersion: true } // Fetch ONLY the version to keep it fast
        });

        if (!user || user.tokenVersion !== decoded.version) {
            console.warn("⚠️ Security Alert: Token version mismatch for user", decoded.userId);
            return res.status(401).json({ error: "Session expired. Please login again." });
        }

        
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: "Invalid token" });
    }
};