import express from "express";
import { addOrder, addOrdersBulk, getOrders } from "../controllers/orderController.js";

const router = express.Router();

router.post("/", addOrder);// Single order
router.post("/bulk", addOrdersBulk);// Bulk insert
router.get("/", getOrders);// Get all orders

export default router;
