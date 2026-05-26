import express from "express";
import { 
  addOrder, 
  addOrdersBulk, 
  getOrders, 
  updateOrderStatus, 
  createRazorpayOrder, 
  verifyRazorpayPayment, 
  getCustomerOrders,
  getBranchOrdersToday,
  markPaymentSuccess,
  cancelOrderCustomer
} from "../controllers/orderController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/", addOrder); // Single order
router.post("/bulk", addOrdersBulk); // Bulk insert
router.get("/", getOrders); // Get all orders
router.put("/:orderId/status", updateOrderStatus); // Update order status
router.get("/branch/:branchId/today", requireAuth, getBranchOrdersToday); // Get branch's today's orders
router.put("/:orderId/payment-success", requireAuth, markPaymentSuccess); // Mark cash payment success

// Razorpay & Customer History Routes
router.post("/razorpay-order", createRazorpayOrder);
router.post("/verify", verifyRazorpayPayment);
router.get("/customer", requireAuth, getCustomerOrders);
router.put("/:orderId/cancel", requireAuth, cancelOrderCustomer);


export default router;

