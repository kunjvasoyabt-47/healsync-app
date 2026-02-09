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
  
  const token = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

  console.log("Extracted token:", token ? "Token found" : "NO TOKEN");

  if (!token) {
    console.log("No token - returning 401");
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    console.log("✅ Token verified. Decoded:", decoded);
    
    req.user = {
      userId: decoded.userId || decoded.id, 
      profileId: decoded.profileId,
      role: decoded.role
    }; 
    
    console.log("✅ req.user set:", req.user);
    console.log("🔓 Calling next()");
    next();
  } catch (error: any) {
    console.log("❌ Token verification failed:", error.message);
    const message = error.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
    return res.status(401).json({ message });
  }
};