import express from "express";
import { searchAll } from "../controllers/searchController.js";

const router = express.Router();

// Unified search endpoint for branch, catering, location, and dish
router.get("/", searchAll);

export default router;
