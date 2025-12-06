import express from "express";
import { getMenuByBranch } from "../controllers/customerMenuController.js";
const router = express.Router();

router.get("/branch/:branchId", getMenuByBranch);
export default router;