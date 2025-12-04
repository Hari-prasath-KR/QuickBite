// routes/staffRoutes.js
import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { getStaffDashboard } from "../controllers/branchAnalyticsController.js";

const router = express.Router();

// Option 1 (recommended: uses req.user.branchId)
//router.get("/dashboard", requireAuth, getStaffDashboard);

// Option 2 (if you want :branchId param)
router.get("/:branchId/dashboard", requireAuth, getStaffDashboard);

export default router;
