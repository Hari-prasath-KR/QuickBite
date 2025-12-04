import express from "express";
import { createStaff } from "../controllers/staffController.js";

const router = express.Router();

router.post("/staff", createStaff);

export default router;
