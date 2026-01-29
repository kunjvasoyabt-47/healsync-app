import express from "express";
import { register, login, logout,forgotPassword,resetPassword } from "../controllers/authController";
import { AUTH_ROUTES } from "../config/routes";


const router = express.Router();

router.post(AUTH_ROUTES.REGISTER, register);
router.post(AUTH_ROUTES.LOGIN, login);
router.post(AUTH_ROUTES.LOGOUT, logout);
router.post(AUTH_ROUTES.FORGET_PASSWORD, forgotPassword);
router.patch(AUTH_ROUTES.RESET_PASSWORD, resetPassword);

export default router;
