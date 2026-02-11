"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyToken = (req, res, next) => {
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
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = {
            userId: decoded.userId || decoded.id,
            profileId: decoded.profileId,
            role: decoded.role
        };
        next();
    }
    catch (error) {
        console.error(`[AUTH] ❌ JWT Error: ${error.message}`);
        const message = error.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
        return res.status(401).json({ message });
    }
};
exports.verifyToken = verifyToken;
//# sourceMappingURL=authMiddleware.js.map