import express from "express";
import { addOrder, addOrdersBulk, getOrders, updateOrderStatus } from "../controllers/orderController.js";

const router = express.Router();

router.post("/", addOrder);// Single order
router.post("/bulk", addOrdersBulk);// Bulk insert
router.get("/", getOrders);// Get all orders
router.put("/:orderId/status",updateOrderStatus);// Update order status (to be implemented)
export default router;
