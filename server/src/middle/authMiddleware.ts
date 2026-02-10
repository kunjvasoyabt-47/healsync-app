import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: any; 
    }
  }
}export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  // 🔍 Add this log to see what Render is actually receiving
  const token = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];
  
  console.log(`[AUTH] Path: ${req.path} | Token Source: ${req.cookies?.accessToken ? "Cookie" : req.headers.authorization ? "Header" : "NONE"}`);

  if (!token) {
    return res.status(401).json({ message: "No token provided - Redirecting" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = {
      userId: decoded.userId || decoded.id, 
      profileId: decoded.profileId,
      role: decoded.role
    }; 
    next();
  } catch (error: any) {
    const message = error.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
    return res.status(401).json({ message });
  }
};