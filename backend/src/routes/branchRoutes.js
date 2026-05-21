import express from "express";
import {
  addBranch,
  getBranchesByCatering,
  deleteBranch,
  getBranchesByCateringPublic,
  getBranchById,
  updateBranchStatus
} from "../controllers/branchController.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();
router.post("/", requireAuth, requireAdmin, addBranch);
router.get("/:cateringId", requireAuth, requireAdmin, getBranchesByCatering);
router.get("/public/:cateringId", getBranchesByCateringPublic); // Public route
router.get("/detail/:id", getBranchById); // Get branch details by ID
router.put("/detail/:id/status", requireAuth, updateBranchStatus); // Update branch status by ID
router.delete("/:id", requireAuth, requireAdmin, deleteBranch);
export default router;

