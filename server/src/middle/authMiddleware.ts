import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db";

declare global {
  namespace Express {
    interface Request {
      user?: any; 
    }
  }
}export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = decoded; 
    next();
  } catch (error: any) {
    // 🟢 Specific message helps frontend logic
    const message = error.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
    return res.status(401).json({ message });
  }
};