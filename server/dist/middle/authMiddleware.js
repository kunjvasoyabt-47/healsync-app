"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../config/db");
const verifyToken = async (req, res, next) => {
    const token = req.cookies.accessToken;
    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // --- THE TOKEN VERSION CHECK ---
        const user = await db_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { tokenVersion: true } // Fetch ONLY the version to keep it fast
        });
        if (!user || user.tokenVersion !== decoded.version) {
            console.warn("⚠️ Security Alert: Token version mismatch for user", decoded.userId);
            return res.status(401).json({ error: "Session expired. Please login again." });
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(403).json({ error: "Invalid token" });
    }
};
exports.verifyToken = verifyToken;
//# sourceMappingURL=authMiddleware.js.map