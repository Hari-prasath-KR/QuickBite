import express from "express";
import { addBranch, getBranchesByCatering, deleteBranch, getBranchesByCateringPublic } from "../controllers/branchController.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();
router.post("/", requireAuth, requireAdmin, addBranch);
router.get("/:cateringId", requireAuth, requireAdmin, getBranchesByCatering);
router.get("/public/:cateringId", getBranchesByCateringPublic); // Public route
router.delete("/:id", requireAuth, requireAdmin, deleteBranch);
export default router;
