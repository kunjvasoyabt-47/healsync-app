"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const routes_1 = require("../config/routes");
const router = express_1.default.Router();
router.post(routes_1.AUTH_ROUTES.REGISTER, authController_1.register);
router.post(routes_1.AUTH_ROUTES.LOGIN, authController_1.login);
router.post(routes_1.AUTH_ROUTES.LOGOUT, authController_1.logout);
router.post(routes_1.AUTH_ROUTES.FORGET_PASSWORD, authController_1.forgotPassword);
router.patch(routes_1.AUTH_ROUTES.RESET_PASSWORD, authController_1.resetPassword);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map