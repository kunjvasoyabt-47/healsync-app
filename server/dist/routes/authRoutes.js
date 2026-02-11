"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const routes_1 = require("../config/routes");
const authMiddleware_1 = require("../middle/authMiddleware");
const router = express_1.default.Router();
router.post(routes_1.AUTH_ROUTES.REGISTER, authController_1.register);
router.post(routes_1.AUTH_ROUTES.LOGIN, authController_1.login);
router.post(routes_1.AUTH_ROUTES.LOGOUT, authController_1.logout);
router.post(routes_1.AUTH_ROUTES.FORGET_PASSWORD, authController_1.forgotPassword);
router.patch(routes_1.AUTH_ROUTES.RESET_PASSWORD, authController_1.resetPassword);
router.get(routes_1.AUTH_ROUTES.ME, authMiddleware_1.verifyToken, authController_1.getMe); // You can add a controller for fetching current user info
router.post(routes_1.AUTH_ROUTES.REFRESH_TOKEN, authController_1.refresh);
router.patch("/update-profile", authMiddleware_1.verifyToken, authController_1.updateProfile);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map