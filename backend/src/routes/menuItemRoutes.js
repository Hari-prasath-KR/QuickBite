import express from "express";
import { addMenuItem, addMenuItemsBulk } from "../controllers/menuItemController.js";

const router = express.Router();

router.post("/", addMenuItem);// Single insert
router.post("/bulk", addMenuItemsBulk);// Bulk insert

export default router;
