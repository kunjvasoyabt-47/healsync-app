import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: any; 
    }
  }
}
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const cookieToken = req.cookies?.accessToken;
  const headerToken = req.headers.authorization?.split(" ")[1];
  const token = cookieToken || headerToken;

  // 🔍 Improved Logging for Production Debugging
  console.log(`[AUTH CHECK] Path: ${req.path}`);
  console.log(`- Cookie Present: ${!!cookieToken}`);
  console.log(`- Header Present: ${!!headerToken}`);

  if (!token) {
    console.warn(`[AUTH] ❌ Access Denied: No token found for ${req.path}`);
    return res.status(401).json({ message: "Session expired. Please login again." });
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
    console.error(`[AUTH] ❌ JWT Error: ${error.message}`);
    const message = error.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
    return res.status(401).json({ message });
  }
};