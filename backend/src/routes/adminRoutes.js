import express from "express";
import { 
  addCateringAdmin,
  getUnassignedCaterings,
  getAllCateringAdmins,
  deleteCateringAdmin,
  getAllUsers,
  updateUserWallet,
  updateUserRole,
  deleteUser,
  getSystemSettings,
  updateSystemSettings
} from "../controllers/adminController.js";
import { requireAdmin,requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/unassigned-caterings",requireAuth,requireAdmin,getUnassignedCaterings);
router.post("/add-catering-admin",requireAuth,requireAdmin,addCateringAdmin);
router.get("/catering-admins",requireAuth,requireAdmin,getAllCateringAdmins);
router.delete("/manage-catering-admins/:id",requireAuth,requireAdmin,deleteCateringAdmin);

// User Registry and Wallet Controls
router.get("/users", requireAuth, requireAdmin, getAllUsers);
router.put("/users/:id/wallet", requireAuth, requireAdmin, updateUserWallet);
router.put("/users/:id/role", requireAuth, requireAdmin, updateUserRole);
router.delete("/users/:id", requireAuth, requireAdmin, deleteUser);

// Global Configurations Control
router.get("/settings", requireAuth, getSystemSettings);
router.put("/settings", requireAuth, requireAdmin, updateSystemSettings);

export default router;
