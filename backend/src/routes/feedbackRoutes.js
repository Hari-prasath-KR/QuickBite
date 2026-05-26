import express from "express";
import { requireAdmin,requireAuth } from "../middleware/auth.js";
import { 
  addFeedback, 
  feedbackList,
  getCateringFeedbackSummary
} from "../controllers/feedbackController.js";

const router = express.Router();

router.post("/",requireAuth,addFeedback);
router.get("/", requireAuth, requireAdmin, feedbackList);
router.get("/catering/:cateringId", requireAuth, getCateringFeedbackSummary);

export default router;
