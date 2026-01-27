import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: any; 
    }
  }
}

export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  // CHANGED: We now look for the token in the cookies, NOT the header
  const token = req.cookies.accessToken;

  if (!token) {
    res.status(401).json({ error: "Access Denied. Please log in." });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid or expired token" });
  }
};