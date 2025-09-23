import express from "express";
import { requireAdmin,requireAuth } from "../middleware/auth.js";
import { addFeedback, feedbackList } from "../controllers/feedbackController.js";

const router = express.Router();

router.post("/",requireAuth,addFeedback);
router.get("/", requireAuth, requireAdmin, feedbackList);

export default router;
