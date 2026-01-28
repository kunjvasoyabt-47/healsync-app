import express from "express";
import { register, login, logout } from "../controllers/authController";
import { AUTH_ROUTES } from "../config/routes";

const router = express.Router();

router.post(AUTH_ROUTES.REGISTER, register);
router.post(AUTH_ROUTES.LOGIN, login);
router.post(AUTH_ROUTES.LOGOUT, logout);

export default router;
