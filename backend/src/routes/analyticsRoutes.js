import express from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { getCateringAnalytics, getIncomeSummary, mostActiveCatering, revenuePerCatering, revenueSummary, topDishes } from "../controllers/analyticsController.js";

const router =express.Router();

router.get("/revenue-summary",requireAuth,requireAdmin,revenueSummary);
router.get("/revenue-per-catering",requireAuth,requireAdmin,revenuePerCatering);
router.get("/top-dishes",requireAuth,requireAdmin,topDishes);
router.get("/most-active-catering",requireAuth,requireAdmin,mostActiveCatering);
router.get("/income-summary", requireAuth, requireAdmin, getIncomeSummary);
router.get("/caterings/:id",requireAuth,requireAdmin, getCateringAnalytics);

export default router;