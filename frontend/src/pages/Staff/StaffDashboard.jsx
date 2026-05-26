import React, { useState, useEffect } from "react";
import StaffNavbar from "../../components/StaffNavbar"; // Import your separate StaffNavbar
import BottomNav from "./BottomNav"; // Import your separate BottomNav
import axios from "axios";
import toast from "react-hot-toast";

const ClockIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none"
    viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M12 6v6h4.5m4.5 0a9 9 0
      11-18 0 9 0 0118 0z" />
  </svg>
);

const CurrencyDollarIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none"
    viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M12 6v12m-3-2.818l.879.659c1.171.879
      3.07.879 4.242 0 1.172-.879
      1.172-2.303 0-3.182C13.536
      12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303
      0-3.182s2.9-.879 4.006 0l.415.33M21
      12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const MagnifyingGlassIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none"
    viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M21 21l-5.197-5.197m0 0A7.5
      7.5 0 105.196 5.196a7.5 7.5
      0 0010.607 10.607z" />
  </svg>
);

const XMarkIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const StatCard = ({ title, value, change, icon, iconBgColor }) => {
  const isGreen = iconBgColor.includes("green");
  const bgTint = isGreen 
    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" 
    : "bg-amber-500/10 border-amber-500/20 text-amber-600";

  return (
    <div className="bg-white/45 backdrop-blur-md border border-white/35 p-5 rounded-3xl flex items-center gap-4 transition-all hover:scale-[1.01] shadow-lg">
      <div className={`p-4 rounded-2xl border shadow-inner flex-shrink-0 flex items-center justify-center ${bgTint}`}>
        {React.cloneElement(icon, { className: "h-6 w-6" })}
      </div>
      <div className="flex-grow min-w-0">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider truncate">{title}</h3>
        <p className="text-3xl font-black text-slate-800 mt-1">{value}</p>
        <p className={`text-[10px] font-black uppercase tracking-wider mt-1 ${isGreen ? "text-emerald-600" : "text-amber-600"}`}>{change}</p>
      </div>
    </div>
  );
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
      <div className="relative flex justify-between items-center w-full min-w-[300px] md:min-w-0">
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

const OrderStatusModal = ({ order, onClose, onStatusUpdated }) => {
  const statusOptions = [
    "Pending",
    "In Progress",
    "Ready for Service",
    "Completed",
    "Cancelled"
  ];

  const [newStatus, setNewStatus] = useState(order.status);
  const [loading, setLoading] = useState(false);
  const [showPaymentCollect, setShowPaymentCollect] = useState(false);
  const [pendingCompleteData, setPendingCompleteData] = useState(null);
  const [showTokenVerify, setShowTokenVerify] = useState(false);
  const [expectedToken, setExpectedToken] = useState("");

  const getStatusColor = (status) => {
    switch (String(status).toLowerCase()) {
      case "pending": return "bg-red-200 text-red-800 border-red-400";
      case "in progress": return "bg-yellow-200 text-yellow-800 border-yellow-400";
      case "ready for service": return "bg-blue-200 text-blue-800 border-blue-400";
      case "completed": return "bg-green-200 text-green-800 border-green-400";
      case "cancelled": return "bg-gray-200 text-gray-800 border-gray-400";
      default: return "bg-gray-200 text-gray-800 border-gray-400";
    }
  };

  const normalizeStatusForApi = (label) => label.toLowerCase();

  const handleSave = async (enforcedMethod = null, tokenVerified = false, razorpayOrderId = null, razorpayPaymentId = null) => {
    const payloadStatus = normalizeStatusForApi(newStatus);
    let paymentData = null;

    if (payloadStatus === "completed" && !order.payment?.paid && !enforcedMethod && !tokenVerified && !pendingCompleteData?.paymentSuccessData) {
      setShowPaymentCollect(true);
      return;
    }

    setLoading(true);
    try {
      if (enforcedMethod) {
        const payRes = await axios.put(
          `http://localhost:5001/api/order/${order._id}/payment-success`,
          { method: enforcedMethod, razorpayOrderId, razorpayPaymentId },
          { withCredentials: true }
        );
        toast.success("Payment marked as successful!");
        paymentData = payRes.data;
        // Instantly notify parent that payment was successful (keeping modal open)
        if (onStatusUpdated) {
          onStatusUpdated(order._id, order.status, paymentData, false);
        }
      }

      if (payloadStatus === "completed" && !tokenVerified) {
        const activeToken = paymentData?.tokenNumber || order.tokenNumber || `TK-${order._id.toString().slice(-4).toUpperCase()}`;
        setExpectedToken(activeToken);
        setPendingCompleteData({ paymentSuccessData: paymentData });
        setShowTokenVerify(true);
        setLoading(false);
        return;
      }

      const targetPaymentData = pendingCompleteData?.paymentSuccessData || paymentData;

      const res = await axios.put(
        `http://localhost:5001/api/order/${order._id}/status`,
        { status: payloadStatus },
        { withCredentials: true }
      );

      console.log("Status Updated:", res.data);
      toast.success("Order status updated successfully!");
      if (onStatusUpdated) onStatusUpdated(order._id, payloadStatus, targetPaymentData, true);
      onClose();
    } catch (err) {
      console.error("Error updating status", err);
      toast.error("Failed to update status.");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    setNewStatus(order.status);
  }, [order]);

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40 p-4">
      <div className="bg-white/95 rounded-2xl shadow-2xl border border-gray-300 w-full max-w-4xl overflow-hidden flex flex-col animate-fadeIn relative">
        <div className="p-6 border-b bg-gradient-to-r from-yellow-500 to-yellow-600 flex justify-between items-center text-white shrink-0">
          <h2 className="text-2xl font-extrabold">Order Details • Table {order.table || "N/A"}</h2>
          <button onClick={onClose} className="hover:scale-110 transition">
            <XMarkIcon className="h-7 w-7 text-white" />
          </button>
        </div>

        {/* Dynamic Horizontal Progress Stepper */}
        <div className="bg-slate-50 p-4 border-b border-gray-200 shrink-0">
          {String(order.status).toLowerCase() === "cancelled" ? (
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

        <div className="grid grid-cols-1 md:grid-cols-3 flex-grow overflow-y-auto">
          <div className="md:col-span-2 p-6 border-r">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Items Ordered ({order.items?.length || 0})</h3>

            <ul className="space-y-4">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <li key={index} className="flex justify-between items-center bg-gray-100 rounded-lg p-3 shadow-sm">
                    <span className="font-medium text-gray-900">{item.name}</span>
                    <div className="flex items-center space-x-6">
                      <span className="text-sm font-semibold text-gray-700">x{item.quantity}</span>
                      <span className="font-bold text-green-700 text-lg">
                        ₹{item.price ? (item.price * item.quantity).toFixed(2) : "0.00"}
                      </span>
                    </div>
                  </li>
                ))
              ) : (
                <p className="text-gray-500 text-center mt-5">No items found for this order.</p>
              )}
            </ul>
          </div>

          <div className="md:col-span-1 p-6 space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Current Status</h3>
              <span className={`text-lg font-bold px-4 py-2 rounded-full border whitespace-nowrap inline-block ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Payment Status</h3>
              <span className={`px-4 py-2 border text-xs font-black rounded-full uppercase tracking-wider whitespace-nowrap block text-center ${
                order.payment?.paid
                  ? "bg-green-50 text-green-700 border-green-200"
                  : order.payment?.method === "PayLater"
                  ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}>
                {order.payment?.paid ? (
                  order.payment?.method === "Cash" ? "💵 Paid (Cash)" :
                  order.payment?.method === "Wallet" ? "✓ Paid (Wallet)" :
                  "💳 Paid (Online)"
                ) : order.payment?.method === "PayLater" ? (
                  "⏱ Pay Later at Counter"
                ) : (
                  "💵 Unpaid"
                )}
              </span>
            </div>

            <div>
              <label className="block text-md font-medium text-gray-700 mb-1">Change Status To</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full p-3 border rounded-lg bg-white shadow focus:ring-2 focus:ring-yellow-500 outline-none"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => handleSave()}
              disabled={newStatus === order.status || loading}
              className={`w-full py-3 rounded-xl font-bold tracking-wide transition-all duration-200 ${
                newStatus === order.status || loading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-yellow-500 text-white hover:bg-yellow-600 hover:shadow-lg"
              }`}
            >
              {loading ? "Updating..." : "Update Status"}
            </button>
          </div>
        </div>
      </div>
      {showPaymentCollect && (
        <CollectPaymentModal
          order={order}
          onClose={() => setShowPaymentCollect(false)}
          onConfirm={async (method, razorpayOrderId = null, razorpayPaymentId = null) => {
            await handleSave(method, false, razorpayOrderId, razorpayPaymentId);
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
            await handleSave(null, true);
          }}
        />
      )}
    </div>
  );
};

const RecentOrders = ({ orders, onOrderClick }) => {
  const [showAll, setShowAll] = useState(false);
  const displayOrders = showAll ? orders : orders.slice(0, 5);

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Orders</h2>
        <p className="text-gray-500">No recent orders to display.</p>
      </div>
    );
  }

  const getStatusClass = (status) =>
    String(status).toLowerCase().includes("completed")
      ? "text-green-600 bg-green-100 border-green-200"
      : String(status).toLowerCase().includes("pending")
      ? "text-red-600 bg-red-100 border-red-200"
      : "text-yellow-600 bg-yellow-100 border-yellow-250";

  const handleViewToggle = (e) => {
    e.preventDefault();
    setShowAll(prev => !prev);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-gray-200 p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
        {orders.length > 5 && (
          <button onClick={handleViewToggle} className="text-sm text-green-600 hover:underline font-semibold">
            {showAll ? "View less" : "View all"}
          </button>
        )}
      </div>

      <div className="relative mb-4">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input type="text" placeholder="Search recent orders" className="w-full bg-gray-50 border border-gray-300 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-yellow-300" />
      </div>

      <ul className="space-y-3">
        {displayOrders.map((order, index) => (
          <li
            key={order._id || index}
            onClick={() => onOrderClick(order)}
            className="flex flex-wrap justify-between items-center p-3.5 bg-gray-50 rounded-xl transition-colors hover:bg-yellow-100/50 cursor-pointer border border-gray-200 gap-3"
          >
            <div className="flex items-center space-x-4 min-w-0 flex-1 sm:flex-initial">
              <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center font-black text-white shadow-md flex-shrink-0">
                {order.customerName ? order.customerName.substring(0, 2).toUpperCase() : (order.userId?.name || "GS").substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-gray-800 truncate max-w-[140px] sm:max-w-[200px]">{order.customerName || order.userId?.name || "Guest"}</p>
                <p className="text-xs text-slate-500 font-semibold">{order.items?.length || 0} items • Table {order.table || "N/A"}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 flex-wrap sm:flex-nowrap gap-y-2">
              <span className={`px-2.5 py-0.5 border text-[10px] font-black rounded-full uppercase tracking-wider whitespace-nowrap ${
                order.payment?.paid
                  ? "bg-green-50 text-green-700 border-green-200"
                  : order.payment?.method === "PayLater"
                  ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}>
                {order.payment?.paid ? (
                  order.payment?.method === "Cash" ? "💵 Paid (Cash)" :
                  order.payment?.method === "Wallet" ? "✓ Paid (Wallet)" :
                  "💳 Paid (Online)"
                ) : order.payment?.method === "PayLater" ? (
                  "⏱ Pay Later"
                ) : (
                  "💵 Unpaid"
                )}
              </span>
              <div className={`flex items-center text-xs font-black px-3 py-1 rounded-full border whitespace-nowrap ${getStatusClass(order.status)}`}>
                <span>{order.status}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {orders.length > 5 && !showAll && (
        <div className="text-center mt-4">
          <button onClick={handleViewToggle} className="text-sm text-green-600 hover:underline font-semibold">
            Show {orders.length - 5} more orders...
          </button>
        </div>
      )}
    </div>
  );
};
const PopularDishes = ({ dishes }) => {
  // Common classes defined for clarity
  const cardClasses = "bg-white border border-gray-200 p-6 rounded-xl shadow-lg h-full";
  const headingClasses = "text-xl font-bold text-gray-900";
  const viewAllClasses = "text-sm text-blue-600 hover:underline"; // Blue link for light theme
  const rankNumberClasses = "text-lg font-bold text-gray-400 w-6";
  const dishNameClasses = "font-semibold text-gray-800";
  const ordersClasses = "text-xs text-gray-500";
  const listItemClasses = "flex items-center space-x-4";

  if (!dishes || dishes.length === 0) {
    return (
      // Light theme styling for the empty state
      <div className={cardClasses}>
        <h2 className={headingClasses + " mb-4"}>Popular Dishes</h2>
        <p className={ordersClasses}>Not enough data for popular dishes yet.</p>
      </div>
    );
  }

  return (
    // Main card container set to white background and light border/shadow
    <div className={cardClasses}>
      <div className="flex justify-between items-center mb-4">
        {/* Dark text for the main heading */}
        <h2 className={headingClasses}>Popular Dishes</h2>
        {/* Standard link color */}
        <a href="#" className={viewAllClasses}>View all</a>
      </div>
      <ul className="space-y-4">
        {dishes.slice(0, 5).map((dish, index) => (
          // List item structure matching the image's layout
          <li key={index} className={listItemClasses}>
            {/* Faded gray text for the rank number */}
            <span className={rankNumberClasses}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <img 
              src={dish.imageUrl || `https://placehold.co/40x40/FBBF24/FFFFFF?text=${dish.name.charAt(0)}`} 
              alt={dish.name} 
              className="w-10 h-10 rounded-full object-cover" 
            />
            <div>
              <p className={dishNameClasses}>{dish.name}</p>
              <p className={ordersClasses}>Orders: {dish.orders}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const StaffDashboard = () => {
  const [time, setTime] = useState(new Date());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ totalEarnings: 0, inProgress: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [popularDishes, setPopularDishes] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const formattedDate = time.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  
  const handleUpdateOrderStatus = (orderId, newStatusLabel, paymentData = null, shouldClose = true) => {
    setRecentOrders(prev =>
      prev
        .map(order => {
          if (order._id === orderId) {
            const updated = { ...order, status: newStatusLabel };
            if (paymentData) {
              return { ...updated, ...paymentData };
            }
            return updated;
          }
          return order;
        })
        .filter(order => {
          const s = String(order.status).toLowerCase();
          return s !== "completed" && s !== "cancelled";
        })
    );

    if (shouldClose) {
      setSelectedOrder(null);
    } else {
      setSelectedOrder(prev => {
        if (prev && prev._id === orderId) {
          const updated = { ...prev, status: newStatusLabel };
          if (paymentData) {
            return { ...updated, ...paymentData };
          }
          return updated;
        }
        return prev;
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const userRes = await axios.get("http://localhost:5001/api/auth/profile", { withCredentials: true });
        const u = userRes.data.data || userRes.data;
        setUser(u);
        const bId = u.branchId;

        if (bId) {
          const dashboardRes = await axios.get(`http://localhost:5001/api/branch-analystics/${bId}/dashboard`, { withCredentials: true });
          const apiPayload = dashboardRes.data.data || dashboardRes.data;

          const filteredRecent = (apiPayload.recentOrders || []).filter(o => {
            const s = String(o.status || "").toLowerCase();
            return s !== "completed" && s !== "cancelled";
          }).reverse();

          setStats(apiPayload.stats || { totalEarnings: 0, inProgress: 0 });
          setRecentOrders(filteredRecent);
          setPopularDishes(apiPayload.popularDishes || []);
        } else {
          console.error("Branch ID not found in user data");
          setError("Branch ID not found in user data");
        }
      } catch (err) {
        console.error("Error fetching dashboard data", err);
        setError("Could not load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getGreeting = () => {
  const hour = time.getHours();

  if (hour >= 5 && hour < 12) return "Good Morning!!";
  if (hour >= 12 && hour < 17) return "Good Afternoon!!";
  if (hour >= 17 && hour < 21) return "Good Evening!!";
  return "Hello!!";
};


  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-green-400 via-yellow-200 to-white text-gray-800 font-sans overflow-hidden">
      <StaffNavbar userName={user?.name || "Staff"} userRole={user?.role || "Staff"} />

      {/* Main Container */}
      <div className="pt-24 pb-28 px-4 md:px-8 flex-1 flex flex-col overflow-hidden max-w-7xl w-full mx-auto space-y-6">
        {loading && (
          <div className="text-center p-10 bg-white/45 backdrop-blur-md border border-white/35 rounded-3xl shadow-xl flex-1 flex items-center justify-center">
            <p className="text-lg font-semibold text-slate-700">Loading dashboard...</p>
          </div>
        )}
        {error && (
          <div className="text-center p-10 bg-rose-500/10 border border-rose-500/25 rounded-3xl flex-1 flex items-center justify-center">
            <p className="text-lg font-semibold text-rose-800">{error}</p>
          </div>
        )}

        {!loading && !error && user && (
          <div className="flex-1 overflow-hidden flex flex-col space-y-6">
            
            {/* Scrollable Center Content Workspace */}
            <div className="flex-1 overflow-y-auto pr-1 pb-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Left 2/3 Column */}
                <div className="lg:col-span-2 space-y-8 animate-fadeIn">
                  
                  {/* Header Block matching the remaining pages exactly */}
                  <div className="flex flex-wrap justify-between items-center gap-4 bg-white/45 backdrop-blur-md border border-white/35 rounded-3xl p-6 shadow-xl shrink-0">
                    <div>
                      <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                        {getGreeting()}, {user?.name || "Staff"}
                      </h1>
                      <p className="text-sm font-semibold text-slate-500 mt-1">
                        Give your best services for customers 😊
                      </p>
                    </div>
                    <div className="text-right bg-white/30 backdrop-blur-md border border-white/40 px-6 py-2.5 rounded-2xl shadow-inner">
                      <p className="text-3xl font-mono font-black tracking-wide text-slate-800">
                        {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
                      </p>
                      <p className="text-[10px] font-black uppercase text-slate-400 mt-0.5 tracking-wider">
                        {formattedDate}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <StatCard title="Total Earnings" value={`₹${stats.totalEarnings.toFixed(2)}`} change={stats.earningsChange || "vs Yesterday"} icon={<CurrencyDollarIcon className="h-6 w-6" />} iconBgColor="bg-green-500" />
                    <StatCard title="In Progress" value={stats.inProgress} change={stats.inProgressChange || "vs Yesterday"} icon={<ClockIcon className="h-6 w-6" />} iconBgColor="bg-yellow-500" />
                  </div>

                  <RecentOrders orders={recentOrders} onOrderClick={setSelectedOrder} />
                </div>

                {/* Right 1/3 Column */}
                <div className="lg:col-span-1">
                  <PopularDishes dishes={popularDishes} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNav />

      {selectedOrder && (
        <OrderStatusModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onStatusUpdated={handleUpdateOrderStatus} />
      )}
    </div>
  );
};

export default StaffDashboard;
