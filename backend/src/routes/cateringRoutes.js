import express from "express";
import upload from "../middleware/multer.js";
import { addCatering, getCaterings, deleteCatering, getCateringById } from "../controllers/cateringController.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.post("/", requireAuth,requireAdmin,upload.single("logo"), addCatering);
router.get("/",getCaterings);
router.get("/:id",requireAuth,requireAdmin,getCateringById)
router.delete("/:id",requireAuth,requireAdmin,deleteCatering);

export default router;
