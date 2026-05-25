import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import StaffNavbar from "../../components/StaffNavbar";
import BottomNav from "./BottomNav";
import { 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaHourglassHalf, 
  FaUser, 
  FaUtensils, 
  FaSearch, 
  FaSync, 
  FaEllipsisV,
  FaArrowRight,
  FaBan
} from "react-icons/fa";
import { MdOutlineReorder } from "react-icons/md";

// Status helpers
const getStatusLabel = (status) => {
  const s = String(status).toLowerCase();
  if (s === "pending") return "Pending";
  if (s === "in progress" || s === "preparing") return "In Progress";
  if (s === "ready for service" || s === "ready") return "Ready for Service";
  if (s === "completed") return "Completed";
  if (s === "cancelled") return "Cancelled";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const getStatusColor = (status) => {
  const s = String(status).toLowerCase();
  if (s === "pending") return "bg-rose-100 text-rose-800 border-rose-250";
  if (s === "in progress" || s === "preparing") return "bg-amber-100 text-amber-800 border-amber-250";
  if (s === "ready for service" || s === "ready") return "bg-sky-100 text-sky-800 border-sky-200";
  if (s === "completed") return "bg-emerald-100 text-emerald-800 border-emerald-250";
  if (s === "cancelled") return "bg-slate-100 text-slate-800 border-slate-200";
  return "bg-gray-100 text-gray-800 border-gray-200";
};

const STEPS = [
  { label: "Pending", icon: "⏳" },
  { label: "Preparing", icon: "🍳" },
  { label: "Ready", icon: "🔔" },
  { label: "Completed", icon: "✓" }
];

const getActiveStep = (status) => {
  const s = String(status).toLowerCase();
  if (s === "pending") return 0;
  if (s === "in progress" || s === "preparing") return 1;
  if (s === "ready" || s === "ready for service") return 2;
  if (s === "completed") return 3;
  return -1;
};

const OrderStepper = ({ status }) => {
  const activeStep = getActiveStep(status);

  if (activeStep === -1) return null;

  return (
    <div className="w-full py-4 px-2 overflow-x-auto scrollbar-none">
      <div className="relative flex justify-between items-center w-full min-w-[320px] md:min-w-0">
        {/* Connection line background */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-slate-100 rounded-full z-0"></div>

        {/* Dynamic completed line */}
        <div
          className="absolute top-5 left-0 h-1 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full transition-all duration-700 ease-out z-0"
          style={{ width: `${(activeStep / (STEPS.length - 1)) * 100}%` }}
        ></div>

        {/* Interactive nodes */}
        {STEPS.map((step, idx) => {
          const isCompleted = idx < activeStep;
          const isActive = idx === activeStep;
          const isPending = idx > activeStep;

          let circleStyle = "";
          let textStyle = "";

          if (isCompleted) {
            circleStyle = "bg-emerald-500 text-white border-emerald-500 scale-105 shadow-md shadow-emerald-100";
            textStyle = "text-emerald-600 font-extrabold";
          } else if (isActive) {
            circleStyle = "bg-white text-emerald-600 border-emerald-500 shadow-lg ring-4 ring-emerald-50 scale-115 animate-pulse";
            textStyle = "text-slate-800 font-black scale-105";
          } else {
            circleStyle = "bg-white text-slate-400 border-slate-200 shadow-sm";
            textStyle = "text-slate-400 font-medium";
          }

          return (
            <div key={idx} className="flex flex-col items-center relative z-10 select-none flex-1">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${circleStyle}`}>
                <span className="text-xs">{step.icon}</span>
              </div>
              <span className={`text-[9px] md:text-xs mt-2 text-center tracking-wider transition-all duration-500 whitespace-nowrap ${textStyle}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CollectPaymentModal = ({ order, onClose, onConfirm }) => {
  const [submitting, setSubmitting] = useState(false);
  const [showMockPaymentModal, setShowMockPaymentModal] = useState(false);
  const [mockPaymentData, setMockPaymentData] = useState(null);

  const handleConfirm = async (method) => {
    if (method === "Cash") {
      setSubmitting(true);
      try {
        await onConfirm("Cash");
      } catch (err) {
        console.error(err);
      } finally {
        setSubmitting(false);
      }
    } else if (method === "Online") {
      setSubmitting(true);
      const grandTotalPaise = Math.round(order.total * 1.05 * 100);
      
      let razorpayOrder;
      try {
        const orderCreateRes = await axios.post("http://localhost:5001/api/order/razorpay-order", {
          amount: grandTotalPaise,
        });
        razorpayOrder = orderCreateRes.data;
      } catch (err) {
        console.warn("⚠️ Backend failed to initialize online payment order, falling back to client-side mock:", err);
        razorpayOrder = {
          id: `order_mock_${Date.now()}`,
          amount: grandTotalPaise,
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
          key_id: "rzp_test_placeholder_key",
          isMock: true
        };
      }

      const options = {
        key: razorpayOrder.key_id,
        amount: razorpayOrder.amount,
        currency: "INR",
        name: "QuickBite Staff Counter",
        description: `Counter Payment for Order #${order._id.substring(order._id.length - 6).toUpperCase()}`,
        order_id: razorpayOrder.id,
        handler: async (response) => {
          try {
            await onConfirm("Online", response.razorpay_order_id, response.razorpay_payment_id);
          } catch (err) {
            console.error("Failed to process counter payment success:", err);
            alert("Failed to confirm payment collection. Please try again.");
          } finally {
            setSubmitting(false);
          }
        },
        prefill: {
          name: order.userId?.name || order.customerName || "Customer",
          email: order.userId?.email || "customer@campus.edu",
        },
        theme: {
          color: "#0284c7", // Sky blue for staff
        },
      };

      if (razorpayOrder.isMock || !window.Razorpay) {
        setMockPaymentData({ options, order: razorpayOrder });
        setShowMockPaymentModal(true);
        setSubmitting(false);
        return;
      }

      try {
        const rzp = new window.Razorpay(options);
        rzp.open();
        setSubmitting(false);
      } catch (sdkError) {
        console.error("⚠️ Razorpay SDK open exception, falling back to mock payment modal:", sdkError);
        setMockPaymentData({ options, order: razorpayOrder });
        setShowMockPaymentModal(true);
        setSubmitting(false);
      }
    }
  };

  const grandTotal = (order.total * 1.05).toFixed(2);

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-slate-100 relative animate-scaleUp text-gray-800">
          {/* Close Button */}
          <button
            onClick={onClose}
            disabled={submitting}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer"
          >
            ✕
          </button>

          {/* Header Icon */}
          <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center text-3xl shadow-inner mb-3">
              💵
            </div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Confirm Payment Collection</h3>
            <p className="text-slate-500 text-xs mt-1 max-w-xs">
              This order is currently unpaid. Please confirm that you have collected the full amount at the counter before completing delivery.
            </p>
          </div>

          {/* Order Info & Total */}
          <div className="my-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm space-y-2">
            <div className="flex justify-between text-slate-500">
              <span>Customer:</span>
              <span className="font-extrabold text-slate-800">{order.userId?.name || order.customerName || "Guest"}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Order Type:</span>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                {order.payment?.method === "PayLater" ? "⏱ Pay Later at Counter" : "💵 Cash Payment"}
              </span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-slate-800 pt-2 border-t border-dashed border-slate-200">
              <span>Grand Total Due:</span>
              <span className="text-emerald-600 text-lg">₹{grandTotal}</span>
            </div>
          </div>

          {/* Action Choices */}
          <div className="space-y-3">
            <button
              onClick={() => handleConfirm("Cash")}
              disabled={submitting}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl transition shadow-md flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              <span>💵</span>
              {submitting ? "Processing..." : "Cash Collected at Counter"}
            </button>
            
            <button
              onClick={() => handleConfirm("Online")}
              disabled={submitting}
              className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs rounded-2xl transition shadow-md flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              <span>📱</span>
              {submitting ? "Processing..." : "UPI / Card Received at Counter"}
            </button>

            <button
              onClick={onClose}
              disabled={submitting}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-2xl transition flex items-center justify-center active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              Cancel & Keep Unpaid
            </button>
          </div>
        </div>
      </div>

      {/* 💳 HIGH-FIDELITY QUICKBITE PAYMENT SANDBOX FALLBACK MODAL */}
      {showMockPaymentModal && mockPaymentData && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 md:p-8 animate-scaleDown text-white">
            
            {/* Header branding */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold">⚡</span>
                <span className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                  RAZORPAY TEST GATEWAY
                </span>
              </div>
              <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                Test Mode
              </span>
            </div>

            {/* Price Details Card */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 mb-6 text-center shadow-inner">
              <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">Amount to Pay</p>
              <h3 className="text-4xl font-black mt-2 text-white">
                ₹{(mockPaymentData.order.amount / 100).toFixed(2)}
              </h3>
              <p className="text-slate-500 text-xs mt-1.5 font-mono">
                Order ID: {mockPaymentData.order.id}
              </p>
            </div>

            {/* Dummy Card Form Graphics */}
            <div className="space-y-4 mb-6">
              <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">💳</span>
                  <div>
                    <p className="text-xs text-slate-400 font-bold">Standard Test Card</p>
                    <p className="text-sm font-mono text-slate-200 mt-0.5">4111 1111 1111 1111</p>
                  </div>
                </div>
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">VISA</span>
              </div>

              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <span>🛡️</span>
                <span>Fully simulated secure end-to-end sandbox session.</span>
              </div>
            </div>

            {/* Checkout Action Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={async () => {
                  setShowMockPaymentModal(false);
                  setSubmitting(true);
                  try {
                    await mockPaymentData.options.handler({
                      razorpay_order_id: mockPaymentData.order.id,
                      razorpay_payment_id: `pay_mock_${Date.now()}`,
                      razorpay_signature: "mock_signature_approved"
                    });
                  } catch (err) {
                    console.error("Mock handler execution failed:", err);
                    alert("Mock payment handler failed.");
                  } finally {
                    setSubmitting(false);
                  }
                }}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition duration-200 shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center space-x-2 text-base cursor-pointer"
              >
                <span>Simulate Payment</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMockPaymentModal(false);
                  setSubmitting(false);
                  alert("Payment cancelled by staff.");
                }}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition duration-200 text-sm cursor-pointer"
              >
                Cancel Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Token Verification Modal Component
const TokenVerificationModal = ({ tokenNumber, onClose, onConfirm }) => {
  const [inputToken, setInputToken] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const expected = String(tokenNumber || "").trim().toUpperCase();
    const entered = String(inputToken).trim().toUpperCase();

    if (entered === expected || entered === expected.replace("TK-", "")) {
      onConfirm();
    } else {
      setError("Incorrect token code. Please verify and try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[120] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 md:p-8 shadow-2xl border border-slate-100 relative animate-scaleUp text-gray-800 text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer font-bold"
        >
          ✕
        </button>

        {/* Header Icon */}
        <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-3xl shadow-inner mb-3">
            🔑
          </div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Verify Order Token</h3>
          <p className="text-slate-500 text-xs mt-1 max-w-xs">
            Ask the customer for their secure Order Token and enter it below to authorize delivery completion.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">
              Customer Token ID
            </label>
            <input
              type="text"
              placeholder="e.g. TK-ABCD"
              value={inputToken}
              onChange={(e) => {
                setInputToken(e.target.value);
                setError("");
              }}
              className="w-full bg-slate-50 border border-slate-205 rounded-2xl py-3 px-4 text-center text-xl font-black tracking-widest text-slate-850 uppercase focus:outline-none focus:border-blue-500 focus:bg-white transition"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-rose-600 text-xs font-extrabold animate-bounce">
              ❌ {error}
            </p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl transition shadow-md flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
            >
              Verify & Complete Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Order Details Modal Component
const OrderDetailModal = ({ order, onClose, onStatusUpdated }) => {
  const [newStatus, setNewStatus] = useState(order.status);
  const [updating, setUpdating] = useState(false);
  const [showPaymentCollect, setShowPaymentCollect] = useState(false);
  const [pendingCompleteData, setPendingCompleteData] = useState(null);
  const [showTokenVerify, setShowTokenVerify] = useState(false);
  const [expectedToken, setExpectedToken] = useState("");

  const statusOptions = [
    "pending",
    "in progress",
    "ready for service",
    "completed",
    "cancelled"
  ];

  const handleUpdate = async (enforcedMethod = null, tokenVerified = false, razorpayOrderId = null, razorpayPaymentId = null) => {
    if (newStatus === "completed" && !order.payment?.paid && !enforcedMethod && !tokenVerified && !pendingCompleteData?.paymentSuccessData) {
      setShowPaymentCollect(true);
      return;
    }

    setUpdating(true);
    try {
      let paymentSuccessData = null;
      if (enforcedMethod) {
        const payRes = await axios.put(
          `http://localhost:5001/api/order/${order._id}/payment-success`,
          { 
            method: enforcedMethod,
            razorpayOrderId,
            razorpayPaymentId
          },
          { withCredentials: true }
        );
        toast.success("Payment marked as successful!");
        paymentSuccessData = payRes.data;
        // Instantly notify parent that payment succeeded (keeping modal open)
        if (onStatusUpdated) {
          onStatusUpdated(order._id, order.status, paymentSuccessData);
        }
      }

      if (newStatus === "completed" && !tokenVerified) {
        const activeToken = paymentSuccessData?.tokenNumber || order.tokenNumber || `TK-${order._id.toString().slice(-4).toUpperCase()}`;
        setExpectedToken(activeToken);
        setPendingCompleteData({ paymentSuccessData });
        setShowTokenVerify(true);
        setUpdating(false);
        return;
      }

      const targetPaymentData = pendingCompleteData?.paymentSuccessData || paymentSuccessData;

      await axios.put(
        `http://localhost:5001/api/order/${order._id}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      toast.success(`Order status updated to ${getStatusLabel(newStatus)}`);
      if (onStatusUpdated) onStatusUpdated(order._id, newStatus, targetPaymentData);
      onClose();
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white/95 border border-white/30 shadow-2xl rounded-3xl w-full max-w-lg overflow-hidden flex flex-col transition-all">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-500 to-green-500 text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black">Order Details</h3>
            <p className="text-xs text-green-100 mt-1 font-semibold">ID: {order._id}</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-white hover:text-green-200 font-bold text-2xl outline-none"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Customer / Order Info */}
          <div className="flex justify-between items-center bg-slate-50 border border-slate-200/50 p-4 rounded-2xl">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">Customer</p>
              <p className="text-md font-bold text-slate-800">{order.userId?.name || "Guest User"}</p>
              <p className="text-xs text-slate-500 font-semibold">{order.userId?.email || ""}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">Time</p>
              <p className="text-sm font-bold text-slate-700">
                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Payment Status Card */}
          <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-2xl flex justify-between items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">Payment Status</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2.5 py-1 text-xs font-black rounded-full uppercase tracking-wider ${
                  order.payment?.paid
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : order.payment?.method === "PayLater"
                    ? "bg-amber-100 text-amber-800 border border-amber-200 animate-pulse"
                    : "bg-rose-100 text-rose-800 border border-rose-200"
                }`}>
                  {order.payment?.paid
                    ? "✓ Paid"
                    : order.payment?.method === "PayLater"
                    ? "⏱ Pay Later at Counter"
                    : "💵 Unpaid (Cash/Counter)"}
                </span>
              </div>
            </div>
            {order.tokenNumber && (
              <div className="text-right">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">Token Number</p>
                <p className="text-sm font-black text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded mt-1 inline-block">
                  {order.tokenNumber}
                </p>
              </div>
            )}
          </div>

          {/* Order Progress Stepper */}
          <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-2xl">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Order Status Pipeline</p>
            {order.status === "cancelled" ? (
              <div className="w-full bg-rose-50 border border-rose-100 text-rose-800 rounded-xl p-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🛑</span>
                  <div>
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-rose-900">Cancelled</h4>
                    <p className="text-rose-500 text-[10px] mt-0.5 font-semibold font-mono">This order was cancelled by the staff.</p>
                  </div>
                </div>
              </div>
            ) : (
              <OrderStepper status={order.status} />
            )}
          </div>

          {/* Items List */}
          <div>
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-3">Items Ordered</h4>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                  <div>
                    <p className="font-extrabold text-slate-800 text-sm">{item.name}</p>
                    <p className="text-xs text-slate-500 font-semibold">₹{item.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-black text-slate-700 bg-slate-100 px-2 py-1 rounded-md">x{item.quantity}</span>
                    <span className="font-black text-emerald-600 text-sm">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total Section */}
          <div className="flex justify-between items-center border-t border-slate-100 pt-4">
            <span className="text-md font-extrabold text-slate-800">Total Amount:</span>
            <span className="text-2xl font-black text-emerald-600">₹{order.total.toFixed(2)}</span>
          </div>

          {/* Status Update Control */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <label className="block text-sm font-black text-slate-800 uppercase tracking-widest">Update Order Status</label>
            <div className="flex gap-2">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:border-green-400"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {getStatusLabel(status)}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleUpdate()}
                disabled={updating || newStatus === order.status}
                className={`px-6 py-3 font-bold text-white rounded-2xl transition duration-300 shadow-sm active:scale-95 ${
                  newStatus === order.status ? "bg-slate-300 cursor-not-allowed" : "bg-emerald-500 hover:bg-emerald-600"
                }`}
              >
                {updating ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
        {showPaymentCollect && (
          <CollectPaymentModal
            order={order}
            onClose={() => setShowPaymentCollect(false)}
            onConfirm={async (method, razorpayOrderId = null, razorpayPaymentId = null) => {
              await handleUpdate(method, false, razorpayOrderId, razorpayPaymentId);
              setShowPaymentCollect(false);
            }}
          />
        )}
        {showTokenVerify && (
          <TokenVerificationModal
            tokenNumber={expectedToken}
            onClose={() => {
              setShowTokenVerify(false);
              setPendingCompleteData(null);
            }}
            onConfirm={async () => {
              setShowTokenVerify(false);
              await handleUpdate(null, true);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Offline Order Modal Component
const OfflineOrderModal = ({ user, onClose, onOrderCreated }) => {
  const [step, setStep] = useState(1); // 1: Items & details, 2: Payment, 3: Success Receipt
  const [customerName, setCustomerName] = useState("");
  const [table, setTable] = useState("");
  const [menuItems, setMenuItems] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState({}); // { itemId: quantity }
  const [paymentMethod, setPaymentMethod] = useState("Cash"); // Cash, Online (Scanner)
  const [createdOrder, setCreatedOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showMockPaymentModal, setShowMockPaymentModal] = useState(false);
  const [mockPaymentData, setMockPaymentData] = useState(null);

  // Load branch menu items on mount
  useEffect(() => {
    if (user?.branchId) {
      fetchBranchMenu();
    }
  }, [user]);

  const fetchBranchMenu = async () => {
    setLoadingMenu(true);
    try {
      const res = await axios.get(`http://localhost:5001/api/menu/branch/${user.branchId}`, { withCredentials: true });
      setMenuItems(res.data);
    } catch (err) {
      console.error("Error fetching branch menu:", err);
      toast.error("Failed to load menu items.");
    } finally {
      setLoadingMenu(false);
    }
  };

  // Get unique categories from menu items
  const categories = ["All", ...new Set(menuItems.map(item => item.menuItemId?.category).filter(Boolean))];

  // Filtered menu items
  const filteredMenuItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === "All" || item.menuItemId?.category === selectedCategory;
    const matchesSearch = item.menuItemId?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (itemId) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const handleRemoveFromCart = (itemId) => {
    setCart(prev => {
      const updated = { ...prev };
      if (updated[itemId] > 1) {
        updated[itemId] -= 1;
      } else {
        delete updated[itemId];
      }
      return updated;
    });
  };

  // Calculations
  const cartItemsCount = Object.values(cart).reduce((a, b) => a + b, 0);
  
  const subtotal = Object.entries(cart).reduce((sum, [itemId, qty]) => {
    const dish = menuItems.find(item => item.menuItemId?._id === itemId || item._id === itemId);
    const price = dish?.price || 0;
    return sum + (price * qty);
  }, 0);

  const gst = subtotal * 0.05; // 5% GST
  const grandTotal = subtotal + gst;

  // Helper to load external script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async (overridePaymentParams = null) => {
    if (cartItemsCount === 0) {
      toast.error("Please add at least one item to cart.");
      return;
    }
    
    // If online payment is selected and no payment details have been provided yet, initiate Razorpay
    if (paymentMethod === "Online" && !overridePaymentParams) {
      setSubmitting(true);
      try {
        // Create order at backend
        let razorpayOrder;
        try {
          const orderCreateRes = await axios.post("http://localhost:5001/api/order/razorpay-order", {
            amount: Math.round(grandTotal * 100), // in Paise
          }, { withCredentials: true });
          razorpayOrder = orderCreateRes.data;
        } catch (e) {
          console.warn("Backend razorpay-order creation failed, utilizing mock sandbox order data:", e);
          razorpayOrder = {
            id: `order_mock_${Date.now()}`,
            amount: Math.round(grandTotal * 100),
            currency: "INR",
            key_id: "rzp_test_placeholder_key",
            isMock: true
          };
        }

        const options = {
          key: razorpayOrder.key_id,
          amount: razorpayOrder.amount,
          currency: "INR",
          name: "QuickBite POS Counter Checkout",
          description: `Payment for Counter Order by ${customerName || "Guest"}`,
          order_id: razorpayOrder.id,
          handler: async (response) => {
            console.log("Razorpay payment counter checkout response received:", response);
            // Verify payment / proceed to save order directly
            await handlePlaceOrder({
              paid: true,
              razorpayOrderId: response.razorpay_order_id || razorpayOrder.id,
              razorpayPaymentId: response.razorpay_payment_id || `pay_mock_${Date.now()}`
            });
          },
          theme: {
            color: "#10b981",
          },
        };

        if (razorpayOrder.isMock) {
          console.warn("⚠️ Razorpay in sandbox mock fallback mode.");
          setMockPaymentData({ options, order: razorpayOrder });
          setShowMockPaymentModal(true);
          setSubmitting(false);
          return;
        }

        const loaded = await loadRazorpayScript();
        if (!loaded || !window.Razorpay) {
          console.warn("⚠️ Razorpay SDK failed to load, launching sandbox mock payment modal.");
          setMockPaymentData({ options, order: razorpayOrder });
          setShowMockPaymentModal(true);
          setSubmitting(false);
          return;
        }

        try {
          const rzp = new window.Razorpay(options);
          rzp.open();
        } catch (sdkError) {
          console.error("⚠️ Razorpay SDK open exception, falling back to mock payment modal:", sdkError);
          setMockPaymentData({ options, order: razorpayOrder });
          setShowMockPaymentModal(true);
        }
      } catch (err) {
        console.error("Razorpay initiation error on staff counter POS:", err);
        toast.error("Failed to initiate counter online payment checkout.");
      } finally {
        setSubmitting(false);
      }
      return;
    }
    
    setSubmitting(true);
    try {
      const items = Object.entries(cart).map(([itemId, quantity]) => {
        const dish = menuItems.find(item => item.menuItemId?._id === itemId || item._id === itemId);
        return {
          itemId: dish?.menuItemId?._id || itemId,
          name: dish?.menuItemId?.name || "Unknown Item",
          price: dish?.price || 0,
          quantity
        };
      });

      const orderData = {
        cateringId: user.cateringId,
        branchId: user.branchId,
        items,
        total: grandTotal,
        status: "pending",
        table,
        customerName: customerName || "Guest Customer",
        payment: {
          method: paymentMethod,
          paid: overridePaymentParams ? overridePaymentParams.paid : (paymentMethod === "Online" ? true : false),
          razorpayOrderId: overridePaymentParams ? overridePaymentParams.razorpayOrderId : null,
          razorpayPaymentId: overridePaymentParams ? overridePaymentParams.razorpayPaymentId : null
        }
      };

      const res = await axios.post("http://localhost:5001/api/order/", orderData, { withCredentials: true });
      setCreatedOrder(res.data);
      
      if (onOrderCreated) {
        onOrderCreated(res.data);
      }
      
      setStep(3); // Go to success receipt screen
      toast.success("Order created successfully!");
    } catch (err) {
      console.error("Error creating offline order:", err);
      toast.error("Failed to place offline order.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn text-gray-800">
      <div className="bg-white border border-slate-100 shadow-2xl rounded-3xl w-full max-w-5xl overflow-hidden flex flex-col transition-all h-[90vh]">
        <style>{`
          @keyframes scan {
            0% { top: 0%; }
            50% { top: 100%; }
            100% { top: 0%; }
          }
          .animate-scanner {
            position: absolute;
            animation: scan 2.5s linear infinite;
          }
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-600 to-green-600 text-white flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-2xl font-black">New Offline Order</h3>
            <p className="text-xs text-green-100 mt-1 font-semibold">Catering POS Terminal • {user?.name || "Staff"}</p>
          </div>
          {step !== 3 && (
            <button 
              onClick={onClose} 
              className="text-white hover:text-green-200 font-bold text-2xl outline-none"
            >
              &times;
            </button>
          )}
        </div>

        {/* Steps Progress Indicator */}
        {step !== 3 && (
          <div className="bg-slate-100/80 border-b border-slate-200 py-3 px-6 flex justify-center items-center gap-8 shrink-0 text-sm font-bold text-gray-500">
            <span className={`flex items-center gap-2 ${step === 1 ? "text-green-700" : "text-slate-400"}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 1 ? "bg-green-600 text-white" : "bg-slate-200 text-slate-500"}`}>1</span>
              Customer & Menu
            </span>
            <div className="w-16 h-0.5 bg-slate-200"></div>
            <span className={`flex items-center gap-2 ${step === 2 ? "text-green-700" : "text-slate-400"}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 2 ? "bg-green-600 text-white" : "bg-slate-200 text-slate-500"}`}>2</span>
              Payment & Finalize
            </span>
          </div>
        )}

        {/* Modal Scrollable Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-slate-50/50">
          
          {/* STEP 1: Items & Customer Details */}
          {step === 1 && (
            <>
              {/* Left Column: Menu list and customer inputs */}
              <div className="flex-1 p-6 overflow-y-auto flex flex-col space-y-5">
                
                {/* Customer Details Fields */}
                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4 shrink-0">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Customer Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Guest Customer (Optional)"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-green-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Table Number</label>
                    <input
                      type="text"
                      placeholder="e.g. Table 5 (Optional)"
                      value={table}
                      onChange={(e) => setTable(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-green-500 transition"
                    />
                  </div>
                </div>

                {/* Filter and Search */}
                <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                  <div className="relative flex-1">
                    <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                    <input
                      type="text"
                      placeholder="Search menu items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-slate-205 rounded-xl py-2 pl-10 pr-4 text-sm font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-green-400 transition"
                    />
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all duration-200 border ${
                          selectedCategory === cat 
                            ? "bg-emerald-600 border-emerald-600 text-white" 
                            : "bg-white border-slate-200 hover:border-slate-350 text-slate-600"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Menu items grid */}
                <div className="flex-1 overflow-y-auto min-h-[250px]">
                  {loadingMenu ? (
                    <div className="flex flex-col items-center justify-center h-full py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-t-transparent mb-3"></div>
                      <p className="text-sm font-black text-slate-500">Loading branch menu...</p>
                    </div>
                  ) : filteredMenuItems.length === 0 ? (
                    <div className="text-center py-16">
                      <p className="text-slate-500 font-bold">No dishes found matching selection.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filteredMenuItems.map(item => {
                        const inCartQty = cart[item.menuItemId?._id || item._id] || 0;
                        const available = item.isAvailable && item.quantity > 0;
                        
                        return (
                          <div 
                            key={item._id} 
                            className={`bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex justify-between items-center ${
                              !available ? "opacity-50" : ""
                            }`}
                          >
                            <div className="flex items-center gap-3 pr-2 min-w-0">
                              {item.menuItemId?.imageUrl ? (
                                <img 
                                  src={item.menuItemId.imageUrl} 
                                  alt={item.menuItemId.name}
                                  className="w-12 h-12 object-cover rounded-xl border border-slate-100 shrink-0"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-slate-100 text-green-600 rounded-xl flex items-center justify-center text-lg shrink-0 border border-slate-200">
                                  <FaUtensils className="text-xs" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-extrabold text-sm text-slate-800 truncate">{item.menuItemId?.name}</p>
                                <p className="text-xs text-slate-400 font-semibold">{item.menuItemId?.category}</p>
                                <p className="text-sm font-black text-emerald-600 mt-0.5">₹{item.price.toFixed(2)}</p>
                              </div>
                            </div>

                            <div className="shrink-0">
                              {!available ? (
                                <span className="text-[10px] font-black tracking-wider uppercase text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                                  Out of Stock
                                </span>
                              ) : inCartQty === 0 ? (
                                <button
                                  type="button"
                                  onClick={() => handleAddToCart(item.menuItemId?._id || item._id)}
                                  className="px-3.5 py-1.5 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 font-black text-xs rounded-xl transition-all duration-200 hover:scale-[1.05]"
                                >
                                  + Add
                                </button>
                              ) : (
                                <div className="flex items-center border border-green-200 rounded-xl bg-green-50 overflow-hidden text-xs">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveFromCart(item.menuItemId?._id || item._id)}
                                    className="px-3 py-1.5 hover:bg-green-100 text-green-700 font-black"
                                  >
                                    -
                                  </button>
                                  <span className="px-2.5 text-green-800 font-extrabold">{inCartQty}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleAddToCart(item.menuItemId?._id || item._id)}
                                    className="px-3 py-1.5 hover:bg-green-100 text-green-700 font-black"
                                    disabled={inCartQty >= item.quantity}
                                  >
                                    +
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: POS Cart Summary */}
              <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-200 p-6 bg-white flex flex-col justify-between shrink-0">
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Current Order</h4>
                    
                    {cartItemsCount === 0 ? (
                      <div className="text-center py-16 text-slate-400">
                        <FaUtensils className="text-3xl mx-auto mb-3 opacity-30 text-green-600" />
                        <p className="font-bold text-xs">Cart is empty</p>
                        <p className="text-[10px] mt-1 font-semibold text-slate-400">Select items from the left menu.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
                        {Object.entries(cart).map(([itemId, qty]) => {
                          const dish = menuItems.find(item => item.menuItemId?._id === itemId || item._id === itemId);
                          const name = dish?.menuItemId?.name || "Unknown Item";
                          const price = dish?.price || 0;

                          return (
                            <div key={itemId} className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0">
                              <div className="min-w-0 pr-2">
                                <p className="font-extrabold text-xs text-slate-800 truncate">{name}</p>
                                <p className="text-[10px] text-slate-400 font-semibold">₹{price.toFixed(2)} each</p>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden text-[10px]">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveFromCart(itemId)}
                                    className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold"
                                  >
                                    -
                                  </button>
                                  <span className="px-2 font-bold text-slate-700">{qty}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleAddToCart(itemId)}
                                    className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold"
                                    disabled={qty >= (dish?.quantity || 99)}
                                  >
                                    +
                                  </button>
                                </div>
                                <span className="font-black text-xs text-slate-800 w-14 text-right">
                                  ₹{(price * qty).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {cartItemsCount > 0 && (
                    <div className="border-t border-slate-100 pt-4 mt-4 space-y-2 shrink-0">
                      <div className="flex justify-between text-xs font-semibold text-slate-500">
                        <span>Items Subtotal:</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs font-semibold text-slate-500">
                        <span>GST (5%):</span>
                        <span>₹{gst.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-base font-black text-slate-800 pt-1 border-t border-slate-50">
                        <span>Grand Total:</span>
                        <span className="text-emerald-600">₹{grandTotal.toFixed(2)}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl transition duration-200 shadow-md hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Proceed to Payment
                        <FaArrowRight className="text-[10px]" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* STEP 2: Payment Selector & Finalize */}
          {step === 2 && (
            <div className="flex-1 p-8 flex flex-col items-center justify-center max-w-2xl mx-auto space-y-6 overflow-y-auto">
              <div className="text-center">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Final Payment</h4>
                <p className="text-3xl font-black text-emerald-600">₹{grandTotal.toFixed(2)}</p>
                <p className="text-xs font-semibold text-slate-500 mt-1">Select transaction method to finalize</p>
              </div>

              {/* Payment selection grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {/* Cash option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("Cash")}
                  className={`p-5 rounded-2xl border text-left flex flex-col justify-between h-36 transition-all duration-300 ${
                    paymentMethod === "Cash"
                      ? "bg-white border-emerald-500 ring-2 ring-emerald-500/10 shadow-md"
                      : "bg-white border-slate-200 hover:border-slate-350 opacity-75 hover:opacity-100"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shadow-inner font-extrabold">
                    ₹
                  </div>
                  <div>
                    <h5 className="font-extrabold text-sm text-slate-800">Cash Payment</h5>
                    <p className="text-[10px] text-slate-400 mt-1 font-semibold">Collect physical currency. Mark order as Unpaid/Pending.</p>
                  </div>
                </button>

                {/* Scanner option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("Online")}
                  className={`p-5 rounded-2xl border text-left flex flex-col justify-between h-36 transition-all duration-300 ${
                    paymentMethod === "Online"
                      ? "bg-white border-emerald-500 ring-2 ring-emerald-500/10 shadow-md"
                      : "bg-white border-slate-200 hover:border-slate-350 opacity-75 hover:opacity-100"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shadow-inner">
                    <FaClock className="text-sm animate-pulse" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-sm text-slate-800">UPI QR Scanner</h5>
                    <p className="text-[10px] text-slate-400 mt-1 font-semibold">Display dynamic QR code. Confirm immediate digital receipt.</p>
                  </div>
                </button>
              </div>

              {/* Dynamic details based on method */}
              <div className="w-full bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                {paymentMethod === "Cash" ? (
                  <div className="text-center space-y-4 py-4">
                    <p className="text-sm font-semibold text-slate-600">
                      Collect <span className="font-extrabold text-slate-800">₹{grandTotal.toFixed(2)}</span> in cash. The order will be placed as <span className="font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">Unpaid</span>.
                    </p>
                    <div className="flex gap-2.5 justify-center">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="px-5 py-2.5 border-2 border-slate-200 hover:border-slate-350 text-slate-600 font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        Back to Menu
                      </button>
                      <button
                        type="button"
                        onClick={handlePlaceOrder}
                        disabled={submitting}
                        className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl transition duration-200 shadow-md active:scale-95 cursor-pointer"
                      >
                        {submitting ? "Processing..." : "Place Cash Order"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-2 space-y-4">
                    {/* Simulated Scanner UPI Box */}
                    <div className="relative border border-slate-200 rounded-2xl p-4 bg-slate-50/50 flex flex-col items-center w-52 shrink-0">
                      {/* Glimmer Scanner Scan line effect */}
                      <div className="absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent animate-scanner z-10 shadow-md animate-bounce"></div>
                      
                      {/* Styled mock QR Code */}
                      <div className="w-40 h-40 bg-white border border-slate-200 rounded-xl flex items-center justify-center relative shadow-sm overflow-hidden p-2">
                        {/* Dynamic looking QR matrix lines simulated by grid */}
                        <div className="grid grid-cols-6 gap-1 w-full h-full opacity-90">
                          {[...Array(36)].map((_, i) => (
                            <div 
                              key={i} 
                              className={`rounded-sm ${(i % 3 === 0 || i % 7 === 0 || i < 6 || i > 30 || i % 6 === 0) ? "bg-slate-800" : "bg-transparent"} ${
                                (i === 0 || i === 5 || i === 30 || i === 35) ? "border-2 border-slate-900 bg-white p-0.5 flex items-center justify-center" : ""
                              }`}
                            >
                              {(i === 0 || i === 5 || i === 30 || i === 35) && <div className="w-full h-full bg-slate-900 rounded-sm"></div>}
                            </div>
                          ))}
                        </div>
                        {/* Center Branding logo */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-8 h-8 bg-green-600 text-white font-black rounded-lg flex items-center justify-center text-[10px] shadow-md border border-white">
                            QB
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center mt-2.5">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scan QR To Pay</p>
                        <p className="text-xs font-black text-slate-700 mt-0.5">quickbite@upi</p>
                      </div>
                    </div>

                    <div className="text-center space-y-3">
                      <p className="text-xs text-slate-500 font-semibold">
                        Once customer completes payment scan on their mobile device, click below to confirm.
                      </p>
                      <div className="flex gap-2.5 justify-center">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="px-5 py-2.5 border-2 border-slate-200 hover:border-slate-350 text-slate-600 font-bold text-xs rounded-xl transition cursor-pointer"
                        >
                          Back to Menu
                        </button>
                        <button
                          type="button"
                          onClick={handlePlaceOrder}
                          disabled={submitting}
                          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition duration-200 shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
                        >
                          {submitting ? "Finalizing..." : "Confirm Payment Success"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Success Confirmation & Formal Invoice Receipt */}
          {step === 3 && createdOrder && (
            <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center justify-center max-w-lg mx-auto py-8">
              
              {/* Animated scaling Success Icon */}
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl shadow-inner mb-4 animate-bounce">
                <FaCheckCircle />
              </div>
              
              <h4 className="text-xl font-black text-slate-800 tracking-tight text-center">Order Created Successfully!</h4>
              <p className="text-xs text-slate-500 mt-1 font-semibold text-center">Receipt details are printed below.</p>

              {/* Formal POS Digital Receipt Slip */}
              <div className="w-full bg-white border border-slate-300 border-dashed shadow-md rounded-2xl p-6 mt-6 space-y-4 font-mono text-xs text-slate-700 leading-relaxed max-h-[50vh] overflow-y-auto">
                <div className="text-center border-b border-dashed pb-3 border-slate-200">
                  <h5 className="font-extrabold text-sm uppercase text-slate-900">QUICKBITE SERVICES</h5>
                  <p className="text-[10px] text-slate-500 font-bold mt-0.5">BRANCH ID • {user?.branchId}</p>
                  <p className="text-[10px] text-slate-500 font-semibold">{new Date(createdOrder.createdAt).toLocaleString()}</p>
                </div>

                {/* Big Unique Token Display */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center my-3 border-dashed">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pickup Token</p>
                  <p className="text-2xl font-black text-green-700 mt-1">
                    {createdOrder.tokenNumber || `TK-${createdOrder._id.toString().slice(-4).toUpperCase()}`}
                  </p>
                  {createdOrder.payment?.paid ? (
                    <p className="text-[9px] font-extrabold text-emerald-600 mt-1 uppercase tracking-wider flex items-center justify-center gap-1">
                      <span>✓</span> Token Active
                    </p>
                  ) : (
                    <p className="text-[9px] font-extrabold text-amber-600 mt-1 uppercase tracking-wider flex items-center justify-center gap-1 animate-pulse">
                      <span>⚠️</span> Unpaid Counter Checkout - Pay at pickup
                    </p>
                  )}
                </div>

                {/* Metadata details */}
                <div className="space-y-1 text-[10px] font-semibold text-slate-500 border-b border-dashed pb-3 border-slate-200">
                  <p><span className="font-bold text-slate-700">Order ID:</span> {createdOrder._id}</p>
                  <p><span className="font-bold text-slate-700">Customer:</span> {createdOrder.customerName}</p>
                  {createdOrder.table && <p><span className="font-bold text-slate-700">Table No:</span> {createdOrder.table}</p>}
                  <p>
                    <span className="font-bold text-slate-700">Payment:</span> {createdOrder.payment?.method} ({createdOrder.payment?.paid ? "PAID" : "UNPAID"})
                  </p>
                </div>

                {/* Items listing */}
                <div className="space-y-1.5 border-b border-dashed pb-3 border-slate-200 text-[10px]">
                  <div className="flex justify-between font-bold text-slate-900 border-b pb-1 border-slate-100">
                    <span>ITEM NAME</span>
                    <div className="flex gap-4">
                      <span>QTY</span>
                      <span className="w-14 text-right">TOTAL</span>
                    </div>
                  </div>
                  {createdOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between font-medium">
                      <span className="truncate max-w-[150px]">{item.name}</span>
                      <div className="flex gap-4">
                        <span className="text-slate-400 font-bold">x{item.quantity}</span>
                        <span className="w-14 text-right">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-1 pt-1 text-[10px] font-bold">
                  <div className="flex justify-between font-medium text-slate-500">
                    <span>Subtotal:</span>
                    <span>₹{(createdOrder.total - (createdOrder.total * 0.05 / 1.05)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-slate-500">
                    <span>GST (5%):</span>
                    <span>₹{(createdOrder.total * 0.05 / 1.05).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-black text-slate-900 pt-1.5 border-t border-slate-100">
                    <span>GRAND TOTAL:</span>
                    <span>₹{createdOrder.total.toFixed(2)}</span>
                  </div>
                </div>

                <p className="text-[9px] text-center font-bold text-slate-400 tracking-wider pt-3">
                  THANK YOU FOR DINING WITH US!
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2.5 w-full mt-6">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex-1 py-3 border-2 border-slate-200 hover:border-slate-350 text-slate-700 font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Print Slip
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition shadow-md flex items-center justify-center cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 💳 HIGH-FIDELITY QUICKBITE PAYMENT SANDBOX FALLBACK MODAL FOR OFFLINE ORDERS */}
      {showMockPaymentModal && mockPaymentData && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 md:p-8 animate-scale-up text-white">
            
            {/* Header branding */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold">⚡</span>
                <span className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                  RAZORPAY TEST GATEWAY (POS)
                </span>
              </div>
              <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                Counter Sandbox
              </span>
            </div>

            {/* Price Details Card */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 mb-6 text-center shadow-inner">
              <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">Amount to Collect</p>
              <h3 className="text-4xl font-black mt-2 text-white">
                ₹{(mockPaymentData.order.amount / 100).toFixed(2)}
              </h3>
              <p className="text-slate-500 text-xs mt-1.5 font-mono">
                Order ID: {mockPaymentData.order.id}
              </p>
            </div>

            {/* Dummy Card Form Graphics */}
            <div className="space-y-4 mb-6">
              <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">💳</span>
                  <div>
                    <p className="text-xs text-slate-400 font-bold">Standard Test Card</p>
                    <p className="text-sm font-mono text-slate-200 mt-0.5">4111 1111 1111 1111</p>
                  </div>
                </div>
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">VISA</span>
              </div>

              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <span>🛡️</span>
                <span>Fully simulated secure end-to-end sandbox session.</span>
              </div>
            </div>

            {/* Checkout Action Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={async () => {
                  setShowMockPaymentModal(false);
                  try {
                    await mockPaymentData.options.handler({
                      razorpay_order_id: mockPaymentData.order.id,
                      razorpay_payment_id: `pay_mock_${Date.now()}`,
                      razorpay_signature: "mock_signature_approved"
                    });
                  } catch (err) {
                    console.error("Mock handler execution failed:", err);
                    alert("Mock payment handler failed.");
                  }
                }}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition duration-200 shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center space-x-2 text-base cursor-pointer"
              >
                <span>Simulate Payment</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMockPaymentModal(false);
                  alert("Counter checkout payment cancelled.");
                }}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition duration-200 text-sm cursor-pointer"
              >
                Cancel Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function OrderPage() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [pendingPaymentOrder, setPendingPaymentOrder] = useState(null);
  const [pendingTokenOrder, setPendingTokenOrder] = useState(null);

  useEffect(() => {
    fetchProfileAndOrders();
  }, []);

  // Poll for new orders every 15 seconds
  useEffect(() => {
    if (!user?.branchId) return;
    const interval = setInterval(() => {
      fetchOrdersSilently();
    }, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchProfileAndOrders = async () => {
    setLoading(true);
    try {
      const userRes = await axios.get("http://localhost:5001/api/auth/profile", { withCredentials: true });
      const u = userRes.data.data || userRes.data;
      setUser(u);
      
      if (u.branchId) {
        const orderRes = await axios.get(`http://localhost:5001/api/order/branch/${u.branchId}/today`, { withCredentials: true });
        setOrders(orderRes.data);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Failed to load today's orders.");
    } finally {
      setLoading(false);
    }
  };

  const refreshOrders = async () => {
    if (!user?.branchId) return;
    setRefreshing(true);
    try {
      const orderRes = await axios.get(`http://localhost:5001/api/order/branch/${user.branchId}/today`, { withCredentials: true });
      setOrders(orderRes.data);
      toast.success("Orders list updated!");
    } catch (err) {
      console.error("Error refreshing orders:", err);
      toast.error("Failed to refresh orders.");
    } finally {
      setRefreshing(false);
    }
  };

  const fetchOrdersSilently = async () => {
    if (!user?.branchId) return;
    try {
      const orderRes = await axios.get(`http://localhost:5001/api/order/branch/${user.branchId}/today`, { withCredentials: true });
      setOrders(orderRes.data);
    } catch (err) {
      console.error("Silent refresh error:", err);
    }
  };

  const handleQuickStatusUpdate = async (orderId, currentStatus, action) => {
    if (pendingTokenOrder || pendingPaymentOrder) return;
    let nextStatus = currentStatus;
    const s = String(currentStatus).toLowerCase();
    
    if (action === "next") {
      if (s === "pending") nextStatus = "in progress";
      else if (s === "in progress" || s === "preparing") nextStatus = "ready for service";
      else if (s === "ready for service" || s === "ready") nextStatus = "completed";
    } else if (action === "cancel") {
      if (!window.confirm("Are you sure you want to cancel this order?")) return;
      nextStatus = "cancelled";
    }

    const targetOrder = orders.find((o) => o._id === orderId);
    if (nextStatus === "completed" && targetOrder) {
      if (!targetOrder.payment?.paid) {
        setPendingPaymentOrder({
          order: targetOrder,
          onConfirm: async (method, razorpayOrderId = null, razorpayPaymentId = null) => {
            try {
              const payRes = await axios.put(
                `http://localhost:5001/api/order/${orderId}/payment-success`,
                { 
                  method,
                  razorpayOrderId,
                  razorpayPaymentId
                },
                { withCredentials: true }
              );
              toast.success("Payment marked as successful!");
              setPendingPaymentOrder(null);

              // Instantly update local orders state in-place with payment success details
              setOrders((prev) =>
                prev.map((o) =>
                  o._id === orderId ? { ...o, ...payRes.data } : o
                )
              );

              // Immediately open Token Verification
              const activeToken = payRes.data?.tokenNumber || targetOrder.tokenNumber || `TK-${orderId.toString().slice(-4).toUpperCase()}`;
              setPendingTokenOrder({
                order: targetOrder,
                expectedToken: activeToken,
                onConfirm: async () => {
                  try {
                    await axios.put(
                      `http://localhost:5001/api/order/${orderId}/status`,
                      { status: "completed" },
                      { withCredentials: true }
                    );
                    toast.success("Order marked as Completed");
                    setOrders((prev) =>
                      prev.map((o) =>
                        o._id === orderId 
                          ? { ...o, ...payRes.data, status: "completed" } 
                          : o
                      )
                    );
                    setPendingTokenOrder(null);
                  } catch (err) {
                    console.error("Error updating status:", err);
                    toast.error("Failed to complete order.");
                  }
                }
              });
            } catch (err) {
              console.error("Error updating payment status:", err);
              toast.error("Failed to mark payment success. Cannot complete order.");
            }
          }
        });
        return;
      } else {
        // Order is already paid, go straight to Token Verification
        const activeToken = targetOrder.tokenNumber || `TK-${orderId.toString().slice(-4).toUpperCase()}`;
        setPendingTokenOrder({
          order: targetOrder,
          expectedToken: activeToken,
          onConfirm: async () => {
            try {
              await axios.put(
                `http://localhost:5001/api/order/${orderId}/status`,
                { status: "completed" },
                { withCredentials: true }
              );
              toast.success("Order marked as Completed");
              setOrders((prev) =>
                prev.map((o) =>
                  o._id === orderId ? { ...o, status: "completed" } : o
                )
              );
              setPendingTokenOrder(null);
            } catch (err) {
              console.error("Error updating status:", err);
              toast.error("Failed to complete order.");
            }
          }
        });
        return;
      }
    }

    try {
      await axios.put(
        `http://localhost:5001/api/order/${orderId}/status`,
        { status: nextStatus },
        { withCredentials: true }
      );
      toast.success(`Order marked as ${getStatusLabel(nextStatus)}`);
      
      // Update state locally
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: nextStatus } : order
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status.");
    }
  };

  const handleModalStatusUpdated = (orderId, newStatus, paymentData = null) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order._id === orderId) {
          const updated = { ...order, status: newStatus };
          if (paymentData) {
            return { ...updated, ...paymentData };
          }
          return updated;
        }
        return order;
      })
    );

    // Keep active selectedOrder synced in-place
    setSelectedOrder((prev) => {
      if (prev && prev._id === orderId) {
        const updated = { ...prev, status: newStatus };
        if (paymentData) {
          return { ...updated, ...paymentData };
        }
        return updated;
      }
      return prev;
    });
  };

  const handleMarkPaymentSuccess = async (orderId) => {
    const targetOrder = orders.find((o) => o._id === orderId);
    if (!targetOrder) return;

    setPendingPaymentOrder({
      order: targetOrder,
      onConfirm: async (method, razorpayOrderId = null, razorpayPaymentId = null) => {
        try {
          const res = await axios.put(
            `http://localhost:5001/api/order/${orderId}/payment-success`,
            { 
              method,
              razorpayOrderId,
              razorpayPaymentId
            },
            { withCredentials: true }
          );
          toast.success("Payment marked as successful!");
          setOrders((prev) =>
            prev.map((order) =>
              order._id === orderId ? { ...order, ...res.data } : order
            )
          );
          setPendingPaymentOrder(null);
        } catch (err) {
          console.error("Error marking payment success:", err);
          toast.error("Failed to mark payment success.");
        }
      }
    });
  };

  const handleOfflineOrderCreated = (newOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
  };

  // Compute stats for today
  const totalCount = orders.length;
  const pendingCount = orders.filter((o) => String(o.status).toLowerCase() === "pending").length;
  const preparingCount = orders.filter((o) => ["in progress", "preparing"].includes(String(o.status).toLowerCase())).length;
  const readyCount = orders.filter((o) => ["ready for service", "ready"].includes(String(o.status).toLowerCase())).length;
  const completedCount = orders.filter((o) => String(o.status).toLowerCase() === "completed").length;
  const cancelledCount = orders.filter((o) => String(o.status).toLowerCase() === "cancelled").length;

  // Filtering & Searching Logic
  const filteredOrders = orders.filter((order) => {
    const label = getStatusLabel(order.status);
    const matchesStatus = statusFilter === "All" || label === statusFilter;
    
    const custName = String(order.userId?.name || "").toLowerCase();
    const tableNum = String(order.table || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    
    const matchesSearch = 
      custName.includes(query) || 
      tableNum.includes(query) ||
      order.items.some((item) => String(item.name).toLowerCase().includes(query));
      
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white text-gray-800 font-sans flex flex-col">
      <StaffNavbar />

      <main className="flex-1 pt-24 pb-28 px-4 sm:px-6 max-w-6xl w-full mx-auto space-y-6">
        {/* Header Block */}
        <div className="flex flex-wrap justify-between items-center gap-4 bg-white/45 backdrop-blur-md border border-white/35 rounded-3xl p-6 shadow-xl">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <MdOutlineReorder className="text-green-600" /> Orders
            </h1>
            <p className="text-sm font-semibold text-slate-500 mt-1">
              View and manage customer orders.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/staff/service"
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-2xl shadow-sm transition active:scale-95 cursor-pointer flex justify-center"
            >
              <FaUtensils className="text-xs" />
              New Offline Order
            </Link>
            <button
              onClick={refreshOrders}
              disabled={refreshing || loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold text-sm rounded-2xl shadow-sm transition active:scale-95 cursor-pointer"
            >
              <FaSync className={`text-xs ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 bg-white/35 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-green-500 border-t-transparent mb-4"></div>
            <p className="text-lg font-black text-slate-700">Loading orders...</p>
          </div>
        ) : (
          <>
            {/* Live Stats Summary Row (Clickable Filters) */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              <button
                onClick={() => setStatusFilter("All")}
                className={`p-4 rounded-2xl border text-left transition-all duration-300 shadow-sm hover:scale-[1.02] flex flex-col justify-between h-24 ${
                  statusFilter === "All" 
                    ? "bg-white border-slate-400 ring-2 ring-slate-400/20" 
                    : "bg-white/60 hover:bg-white border-white/30"
                }`}
              >
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">Total</span>
                <span className="text-2xl font-black text-slate-800">{totalCount}</span>
              </button>

              <button
                onClick={() => setStatusFilter("Pending")}
                className={`p-4 rounded-2xl border text-left transition-all duration-300 shadow-sm hover:scale-[1.02] flex flex-col justify-between h-24 ${
                  statusFilter === "Pending" 
                    ? "bg-rose-50 border-rose-300 ring-2 ring-rose-400/20" 
                    : "bg-white/60 hover:bg-white border-white/30"
                }`}
              >
                <span className="text-xs font-black uppercase tracking-wider text-rose-500">Pending</span>
                <span className="text-2xl font-black text-rose-700">{pendingCount}</span>
              </button>

              <button
                onClick={() => setStatusFilter("In Progress")}
                className={`p-4 rounded-2xl border text-left transition-all duration-300 shadow-sm hover:scale-[1.02] flex flex-col justify-between h-24 ${
                  statusFilter === "In Progress" 
                    ? "bg-amber-50 border-amber-300 ring-2 ring-amber-400/20" 
                    : "bg-white/60 hover:bg-white border-white/30"
                }`}
              >
                <span className="text-xs font-black uppercase tracking-wider text-amber-500">Preparing</span>
                <span className="text-2xl font-black text-amber-700">{preparingCount}</span>
              </button>

              <button
                onClick={() => setStatusFilter("Ready for Service")}
                className={`p-4 rounded-2xl border text-left transition-all duration-300 shadow-sm hover:scale-[1.02] flex flex-col justify-between h-24 ${
                  statusFilter === "Ready for Service" 
                    ? "bg-sky-50 border-sky-300 ring-2 ring-sky-400/20" 
                    : "bg-white/60 hover:bg-white border-white/30"
                }`}
              >
                <span className="text-xs font-black uppercase tracking-wider text-sky-500">Ready</span>
                <span className="text-2xl font-black text-sky-700">{readyCount}</span>
              </button>

              <button
                onClick={() => setStatusFilter("Completed")}
                className={`p-4 rounded-2xl border text-left transition-all duration-300 shadow-sm hover:scale-[1.02] flex flex-col justify-between h-24 ${
                  statusFilter === "Completed" 
                    ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400/20" 
                    : "bg-white/60 hover:bg-white border-white/30"
                }`}
              >
                <span className="text-xs font-black uppercase tracking-wider text-emerald-500">Completed</span>
                <span className="text-2xl font-black text-emerald-700">{completedCount}</span>
              </button>

              <button
                onClick={() => setStatusFilter("Cancelled")}
                className={`p-4 rounded-2xl border text-left transition-all duration-300 shadow-sm hover:scale-[1.02] flex flex-col justify-between h-24 ${
                  statusFilter === "Cancelled" 
                    ? "bg-slate-100 border-slate-300 ring-2 ring-slate-400/20" 
                    : "bg-white/60 hover:bg-white border-white/30"
                }`}
              >
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">Cancelled</span>
                <span className="text-2xl font-black text-slate-700">{cancelledCount}</span>
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="relative bg-white/45 backdrop-blur-md border border-white/35 rounded-2xl p-4 shadow-lg flex items-center">
              <FaSearch className="absolute left-7 text-slate-400 text-lg" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/70 border border-slate-200 rounded-xl py-3 pl-12 pr-4 font-semibold text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all"
              />
            </div>

            {/* Main Orders Board Grid */}
            <div className="bg-white/35 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl p-8 transition-all">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  {statusFilter} Orders ({filteredOrders.length})
                </h2>
                <div className="w-16 h-1 bg-gradient-to-r from-emerald-500 to-green-400 rounded-full shadow-sm"></div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-lg font-bold text-slate-500">No orders found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredOrders.map((order) => {
                    const statusVal = String(order.status).toLowerCase();
                    const isDoneOrCancelled = ["completed", "cancelled"].includes(statusVal);
                    
                    return (
                      <div 
                        key={order._id}
                        className="bg-white/60 hover:bg-white border border-white/20 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 relative"
                      >
                        {/* Elegant Header Layout to prevent collapsing */}
                        <div className="border-b border-slate-100 pb-3 mb-3">
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <h3 className="text-base font-black text-slate-800 leading-tight truncate max-w-[70%]" title={order.userId?.name || order.customerName || "Guest"}>
                              {order.userId?.name || order.customerName || "Guest"}
                            </h3>
                            <span className={`px-2.5 py-1 text-[10px] font-black tracking-wider uppercase rounded-full shadow-sm border shrink-0 ${getStatusColor(order.status)}`}>
                              {getStatusLabel(order.status)}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-[10px]">
                            <span className="font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                              🕒 {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {order.table && (
                              <span className="font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                🪑 Table: {order.table}
                              </span>
                            )}
                            {order.tokenNumber && (
                              <span className="font-black text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded">
                                🎟️ Token: {order.tokenNumber}
                              </span>
                            )}
                            {order.payment?.paid ? (
                              <span className="font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                                ✓ Paid ({order.payment?.method || "Online"})
                              </span>
                            ) : (
                              <span className={`font-black px-2 py-0.5 rounded border animate-pulse ${
                                order.payment?.method === "PayLater"
                                  ? "text-amber-700 bg-amber-50 border-amber-200"
                                  : "text-rose-700 bg-rose-50 border-rose-200"
                              }`}>
                                {order.payment?.method === "PayLater" ? "⏱️ Unpaid • Pay Later" : "💵 Unpaid • Cash"}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Items Checklist */}
                        <div className="py-3 border-y border-slate-100/60 my-2 space-y-1.5 flex-1">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm text-slate-700 font-semibold">
                              <span className="truncate pr-2">{item.name}</span>
                              <span className="text-xs font-black text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded-md shrink-0">x{item.quantity}</span>
                            </div>
                          ))}
                        </div>

                        {/* Total Value */}
                        <div className="flex justify-between items-center py-2 mb-4">
                          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total</span>
                          <span className="text-lg font-black text-emerald-600">₹{order.total.toFixed(2)}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                          {!order.payment?.paid && (order.payment?.method === "Cash" || order.payment?.method === "PayLater") && (
                            <button
                              type="button"
                              onClick={() => handleMarkPaymentSuccess(order._id)}
                              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                            >
                              <FaCheckCircle className="text-xs" />
                              {order.payment?.method === "PayLater" ? "Mark Paid (Pay Later Collected)" : "Mark Paid (Cash Received)"}
                            </button>
                          )}
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(order)}
                              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition shadow-sm"
                              title="View Full Details"
                            >
                              <FaEllipsisV className="text-xs" />
                            </button>

                            {!isDoneOrCancelled && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleQuickStatusUpdate(order._id, order.status, "cancel")}
                                  className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
                                >
                                  Cancel
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleQuickStatusUpdate(order._id, order.status, "next")}
                                  className="flex-[2] py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
                                >
                                  {statusVal === "pending" && (
                                    <>Prepare</>
                                  )}
                                  {(statusVal === "in progress" || statusVal === "preparing") && (
                                    <>Mark Ready</>
                                  )}
                                  {(statusVal === "ready for service" || statusVal === "ready") && (
                                    <>Complete</>
                                  )}
                                  <FaArrowRight className="text-[9px]" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <BottomNav />

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdated={handleModalStatusUpdated}
        />
      )}

      {showOfflineModal && (
        <OfflineOrderModal
          user={user}
          onClose={() => setShowOfflineModal(false)}
          onOrderCreated={handleOfflineOrderCreated}
        />
      )}

      {pendingPaymentOrder && (
        <CollectPaymentModal
          order={pendingPaymentOrder.order}
          onClose={() => setPendingPaymentOrder(null)}
          onConfirm={pendingPaymentOrder.onConfirm}
        />
      )}

      {pendingTokenOrder && (
        <TokenVerificationModal
          tokenNumber={pendingTokenOrder.expectedToken}
          onClose={() => setPendingTokenOrder(null)}
          onConfirm={pendingTokenOrder.onConfirm}
        />
      )}
    </div>
  );
}

export default OrderPage;
