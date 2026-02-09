import express from "express";
import { register, login, logout,forgotPassword,resetPassword, getMe, refresh, updateProfile, } from "../controllers/authController";
import { AUTH_ROUTES } from "../config/routes";
import { verifyToken } from "../middle/authMiddleware";


const router = express.Router();

router.post(AUTH_ROUTES.REGISTER, register);
router.post(AUTH_ROUTES.LOGIN, login);
router.post(AUTH_ROUTES.LOGOUT, logout);
router.post(AUTH_ROUTES.FORGET_PASSWORD, forgotPassword);
router.patch(AUTH_ROUTES.RESET_PASSWORD, resetPassword);
router.get(AUTH_ROUTES.ME,verifyToken, getMe); // You can add a controller for fetching current user info
router.post(AUTH_ROUTES.REFRESH_TOKEN, refresh);
router.patch("/update-profile", verifyToken, updateProfile);

export default router;
