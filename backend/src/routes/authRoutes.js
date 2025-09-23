import express from "express"
import { register,login, logout, getProfile } from "../controllers/authController.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

const router =express.Router();

router.post("/register",register);
router.post("/login",login);
router.get("/profile",requireAuth, getProfile);
router.post("/logout",logout);

export default router; 