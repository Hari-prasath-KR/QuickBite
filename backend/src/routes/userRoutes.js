import express from "express";
import { getUserById, updateProfile, updateProfilePhoto } from "../controllers/userController.js";
import { requireAuth } from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.put("/update", requireAuth, updateProfile);
router.put("/profile-photo", requireAuth, upload.single("profileImage"), updateProfilePhoto);
router.get("/:id", getUserById);

export default router;

