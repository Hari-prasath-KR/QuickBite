import express from "express";
import { addBranch, addStaff, deleteBranchById, deleteStaff, getAllBranches, getAllStaff, getCateringAnalytics, updateBranch, updateStaff } from "../controllers/cateringAdminController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Catering admin can fetch only their own catering data
router.get("/analytics", requireAuth, getCateringAnalytics);
router.get("/branches", requireAuth, getAllBranches);
router.delete("/branches/:id", requireAuth,deleteBranchById);
router.post("/branches/",requireAuth,addBranch);
router.put('/branches/:id', requireAuth, updateBranch);
router.post("/branches/staff",requireAuth,addStaff);
router.get("/branches/staff", requireAuth, getAllStaff);
router.put("/branches/staff/:id", requireAuth, updateStaff);
router.delete("/branches/staff/:id", requireAuth, deleteStaff);
export default router;
