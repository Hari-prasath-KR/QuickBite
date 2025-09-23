import express from "express";
import { addCateringAdmin,getUnassignedCaterings,getAllCateringAdmins,deleteCateringAdmin } from "../controllers/adminController.js";
import { requireAdmin,requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/unassigned-caterings",requireAuth,requireAdmin,getUnassignedCaterings);
router.post("/add-catering-admin",requireAuth,requireAdmin,addCateringAdmin);
router.get("/catering-admins",requireAuth,requireAdmin,getAllCateringAdmins);
router.delete("/manage-catering-admins/:id",requireAuth,requireAdmin,deleteCateringAdmin);


export default router;