import express from "express";
import { getUserById, uploadProfilePhoto, updateProfile } from "../controllers/userController.js";
import { requireAuth } from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.get("/:id", getUserById);
router.put("/profile-photo", requireAuth, upload.single("profileImage"), uploadProfilePhoto);
router.put("/update", requireAuth, updateProfile);

export default router;
