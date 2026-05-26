import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomerNavbar from "../components/CustomerNavbar";
import api from "../utils/api";
import { 
  ArrowLeft, 
  Star, 
  Coins, 
  X, 
  ShoppingBag, 
  AlertTriangle, 
  HelpCircle,
  Clock,
  ThumbsUp,
  MessageSquare
} from "lucide-react";
import { toast } from "react-hot-toast";

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
      <div className="relative flex justify-between items-center w-full min-w-[340px] md:min-w-0">
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
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${circleStyle}`}>
                <span className="text-base">{step.icon}</span>
              </div>
              <span className={`text-[10px] md:text-xs mt-2 text-center tracking-wider transition-all duration-500 whitespace-nowrap ${textStyle}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null); // Holds order for receipt pop-up
  const [showReceipt, setShowReceipt] = useState(false);

  // Cancellation Modal States
  const [cancelTargetOrder, setCancelTargetOrder] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // Feedback Modal States
  const [feedbackTargetCatering, setFeedbackTargetCatering] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [submittedFeedbackOrderIds, setSubmittedFeedbackOrderIds] = useState(() => {
    const saved = localStorage.getItem("qb_submitted_feedbacks") || "[]";
    return JSON.parse(saved);
  });

  const [taxRate, setTaxRate] = useState(5.0);

  useEffect(() => {
    fetchOrderHistory();
  }, [navigate]);

  const fetchOrderHistory = async () => {
    try {
      setLoading(true);
      const [res, settingsRes] = await Promise.all([
        api.get("/order/customer"),
        api.get("/admin/settings").catch((e) => {
          console.log("Ignored settings load error in history:", e);
          return { data: { taxRate: 5.0 } };
        })
      ]);
      setOrders(res.data);
      if (settingsRes && settingsRes.data) {
        setTaxRate(settingsRes.data.taxRate);
      }
    } catch (err) {
      console.error("Error fetching order history:", err);
      if (err.response && err.response.status === 401) {
        toast.error("Please login to view your order history.");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };


  const openReceipt = (order) => {
    setSelectedOrder(order);
    setShowReceipt(true);
  };

  const handleCancelOrder = async () => {
    if (!cancelTargetOrder) return;
    setCancelling(true);
    try {
      const res = await api.put(`/order/${cancelTargetOrder._id}/cancel`);
      toast.success(res.data.message || "Order cancelled successfully!");
      setCancelTargetOrder(null);
      fetchOrderHistory();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to cancel order.");
    } finally {
      setCancelling(false);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackTargetCatering) return;
    setSubmittingFeedback(true);
    try {
      await api.post("/admin/feedback", {
        cateringId: feedbackTargetCatering.cateringId,
        rating: feedbackRating,
        comment: feedbackComment
      });
      toast.success("Thank you for your valuable feedback!");
      
      // Save completed feedback to localStorage to prevent repeated reviews for the same order
      const updated = [...submittedFeedbackOrderIds, feedbackTargetCatering.orderId];
      setSubmittedFeedbackOrderIds(updated);
      localStorage.setItem("qb_submitted_feedbacks", JSON.stringify(updated));

      setFeedbackTargetCatering(null);
      setFeedbackComment("");
      setFeedbackRating(5);
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const s = String(status).toLowerCase();
    if (s === "completed") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (s === "in progress" || s === "preparing") {
      return "bg-amber-50 text-amber-700 border-amber-200 animate-pulse";
    }
    if (s === "ready") {
      return "bg-sky-50 text-sky-700 border-sky-200";
    }
    if (s === "cancelled") {
      return "bg-rose-50 text-rose-700 border-rose-200";
    }
    return "bg-rose-50 text-rose-700 border-rose-200";
  };

  const getCancellationEstimate = (order) => {
    if (!order) return { refund: 0, penalty: 0, detail: "" };
    const status = String(order.status).toLowerCase();
    const isPaid = order.payment?.paid;
    const total = order.total;

    if (isPaid) {
      if (status === "pending") {
        return { refund: total, penalty: 0, detail: "100% Full Refund (Pending status)" };
      } else if (status === "preparing" || status === "in progress") {
        return { refund: Number((total * 0.75).toFixed(2)), penalty: 0, detail: "75% Refund, 25% Cancellation Charge (Preparing status)" };
      } else if (status === "ready" || status === "ready for service") {
        return { refund: Number((total * 0.50).toFixed(2)), penalty: 0, detail: "50% Refund, 50% Cancellation Charge (Ready status)" };
      }
    } else {
      if (status === "pending") {
        return { refund: 0, penalty: 0, detail: "0% Penalty (Pending status)" };
      } else if (status === "preparing" || status === "in progress") {
        return { refund: 0, penalty: Number((total * 0.25).toFixed(2)), detail: "25% Cancellation Penalty (Preparing status) will be deducted from your wallet" };
      } else if (status === "ready" || status === "ready for service") {
        return { refund: 0, penalty: Number((total * 0.50).toFixed(2)), detail: "50% Cancellation Penalty (Ready status) will be deducted from your wallet" };
      }
    }
    return { refund: 0, penalty: 0, detail: "" };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-400 via-yellow-200 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mb-4"></div>
        <p className="text-green-900 font-semibold text-lg animate-pulse">Loading Your Order History...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-200 to-white">
      {/* Fixed Navbar */}
      <div className="fixed top-0 left-0 w-full z-50">
        <CustomerNavbar />
      </div>

      <div className="pt-28 px-4 md:px-8 pb-16 container mx-auto max-w-5xl">
        
        {/* Page Header */}
        <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/50 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-left">
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Your Order History 📜</h1>
            <p className="text-slate-600 text-sm mt-1">Keep track of your campus meals, feedback ratings, pre-payments, and order cancellations.</p>
          </div>
          <button
            onClick={() => navigate("/customer")}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-[0.98]"
          >
            🍕 Place New Order
          </button>
        </div>

        {/* Orders Listing */}
        {orders.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-md rounded-3xl p-16 text-center border border-white/50 shadow-lg">
            <span className="text-6xl">🍲</span>
            <h3 className="text-2xl font-bold text-slate-700 mt-4">No Orders Placed Yet</h3>
            <p className="text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
              Skip the queues at college canteens. Go choose your meals and complete your pre-payment checkout.
            </p>
            <button
              onClick={() => navigate("/customer")}
              className="mt-6 px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl shadow-md transition-all"
            >
              Order Delicious Food Now!
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const status = String(order.status).toLowerCase();
              const canCancel = 
                status === "pending" || 
                status === "preparing" || 
                status === "in progress" || 
                status === "ready" || 
                status === "ready for service";
              const isCompleted = status === "completed";
              const isFeedbackSubmitted = submittedFeedbackOrderIds.includes(order._id);

              return (
                <div
                  key={order._id}
                  className="bg-white/70 backdrop-blur-md rounded-[2rem] shadow-md border border-white/40 p-5 md:p-6 transition hover:shadow-lg hover:-translate-y-0.5 duration-300 flex flex-col md:flex-row justify-between gap-6"
                >
                  {/* Order Meta & Items */}
                  <div className="flex-1 space-y-4 text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
                      {/* Left: Ref & Date */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 font-bold text-[10px] uppercase bg-slate-200 text-slate-700 rounded-full">
                          Ref: {order._id.substring(order._id.length - 8).toUpperCase()}
                        </span>
                        <span className="text-slate-500 text-xs font-semibold font-mono">
                          📅 {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Right: Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-3 py-1 border text-[10px] font-black rounded-full uppercase tracking-wider ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                        <span className={`px-3 py-1 border text-[10px] font-black rounded-full uppercase tracking-wider ${
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
                    </div>

                    {/* Stepper or Cancelled Banner */}
                    <div className="py-2 mb-2">
                      {status === "cancelled" ? (
                        <div className="w-full bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl p-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg">🛑</span>
                            <div>
                              <h4 className="font-extrabold text-xs uppercase tracking-wider text-rose-900">Order Cancelled</h4>
                              <p className="text-rose-500 text-[10px] mt-0.5 font-semibold">This transaction is cancelled. Refund/Penalty terms applied.</p>
                            </div>
                          </div>
                          <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 border border-rose-200 text-[9px] font-black tracking-widest uppercase rounded-full">
                            CANCELLED
                          </span>
                        </div>
                      ) : (
                        <OrderStepper status={order.status} />
                      )}
                    </div>

                    <div>
                      <h3 className="text-xl font-extrabold text-slate-800 uppercase tracking-wide">
                        {order.cateringId?.name || "Campus Catering"}
                      </h3>
                      <p className="text-slate-500 text-xs font-semibold mt-0.5">
                        📍 {order.branchId?.name || "Main Branch"} ({order.branchId?.location || "Campus"})
                      </p>
                    </div>

                    {/* Summary of Items */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Items Summary</p>
                      <div className="flex flex-wrap gap-2">
                        {order.items.map((it, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg shadow-sm"
                          >
                            {it.name} <span className="text-green-600 font-extrabold">×{it.quantity}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Actions */}
                  <div className="flex flex-col justify-between items-start md:items-end border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 min-w-[180px] text-left md:text-right">
                    <div className="space-y-1">
                      <p className="text-slate-400 text-xs font-semibold">
                        {order.payment?.paid ? "Grand Total paid" : "Grand Total (Pay at Counter)"}
                      </p>
                      <p className="text-2xl font-black text-green-600">₹{(order.total * (1 + taxRate / 100)).toFixed(2)}</p>
                      <p className="text-slate-400 text-[10px] italic">Includes {taxRate.toFixed(1)}% GST (₹{(order.total * (taxRate / 100)).toFixed(2)})</p>
                    </div>

                    <div className="space-y-2 w-full mt-6">
                      
                      {/* View Receipt */}
                      <button
                        onClick={() => openReceipt(order)}
                        className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl transition text-[11px] uppercase tracking-wider shadow-sm flex items-center justify-center gap-1.5"
                      >
                        🧾 View Bill Invoice
                      </button>

                      {/* Cancel Order (Active only) */}
                      {canCancel && (
                        <button
                          onClick={() => setCancelTargetOrder(order)}
                          className="w-full py-2.5 px-4 bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-500/20 font-extrabold rounded-xl transition text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5"
                        >
                          🚫 Cancel Order
                        </button>
                      )}

                      {/* Rate Canteen (Completed only) */}
                      {isCompleted && (
                        <button
                          onClick={() => {
                            if (isFeedbackSubmitted) return;
                            setFeedbackTargetCatering({
                              cateringId: order.cateringId?._id || order.cateringId,
                              cateringName: order.cateringId?.name || "Catering Provider",
                              orderId: order._id
                            });
                          }}
                          disabled={isFeedbackSubmitted}
                          className={`w-full py-2.5 px-4 border font-extrabold rounded-xl transition text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 ${
                            isFeedbackSubmitted 
                              ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                              : "bg-amber-500 hover:bg-amber-600 text-white border-amber-500 shadow-sm"
                          }`}
                        >
                          <Star className="w-3.5 h-3.5" />
                          {isFeedbackSubmitted ? "✓ Review Logged" : "⭐ Rate & Review"}
                        </button>
                      )}

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- MODAL 1: CANCEL CONFIRMATION OVERLAY --- */}
      {cancelTargetOrder && (() => {
        const { refund, penalty, detail } = getCancellationEstimate(cancelTargetOrder);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white/95 backdrop-blur-2xl border border-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl space-y-6 text-left relative animate-scaleUp">
              <button
                onClick={() => setCancelTargetOrder(null)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-slate-950">
                <span className="px-3 py-1 bg-rose-500/10 text-rose-700 text-xs font-black rounded-full border border-rose-200 inline-flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Platform Cancellation Policy
                </span>
                <h3 className="text-xl font-black mt-3">Confirm Order Cancellation?</h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">Cancellation refund & penalty metrics calculated strictly by canteen preparation stage:</p>
              </div>

              {/* Estimate Details Card */}
              <div className="p-5 bg-rose-500/[0.03] border border-rose-500/10 rounded-2xl space-y-3 text-xs">
                <div className="flex justify-between items-center font-bold text-slate-700">
                  <span>Current Stage:</span>
                  <span className="font-extrabold text-slate-900 uppercase tracking-wider">{cancelTargetOrder.status}</span>
                </div>
                
                <div className="flex justify-between items-center font-bold text-slate-700">
                  <span>Payment Status:</span>
                  <span className="font-extrabold text-slate-900">{cancelTargetOrder.payment?.paid ? "💳 Pre-paid (Refundable)" : "💵 Pay Later (Subject to Penalty)"}</span>
                </div>

                <div className="border-t border-slate-200/50 pt-2">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Adjustment Detail</p>
                  <p className="text-[11px] font-extrabold text-slate-800 mt-0.5 leading-relaxed">{detail}</p>
                </div>

                {cancelTargetOrder.payment?.paid ? (
                  <div className="flex justify-between items-center pt-2 border-t font-black">
                    <span className="text-slate-600">Wallet Return Balance:</span>
                    <span className="text-emerald-600 text-sm">+ ₹{refund.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center pt-2 border-t font-black">
                    <span className="text-slate-600">Wallet Penalty Charge:</span>
                    <span className="text-rose-600 text-sm">- ₹{penalty.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>

              {/* Alert prompt */}
              <div className="p-3.5 bg-amber-500/[0.04] border border-amber-500/15 text-[11px] font-semibold text-amber-800 leading-relaxed rounded-xl">
                📢 Warning: Cancelled funds will post immediately to your campus QuickBite Wallet. Deductions for Pay Later cancellation penalties can result in negative wallet balances.
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setCancelTargetOrder(null)}
                  className="flex-1 py-3.5 border-2 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 transition"
                >
                  No, Keep Order
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="flex-1 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-rose-600/10 transition active:scale-[0.98]"
                >
                  {cancelling ? "Processing..." : "Yes, Cancel Order"}
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* --- MODAL 2: INTERACTIVE RATINGS & FEEDBACK OVERLAY --- */}
      {feedbackTargetCatering && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-2xl border border-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl space-y-6 text-left relative animate-scaleUp">
            <button
              onClick={() => setFeedbackTargetCatering(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="px-3 py-1 bg-amber-500/10 text-amber-700 text-xs font-black rounded-full border border-amber-200 inline-flex items-center gap-1">
                <ThumbsUp className="w-3.5 h-3.5" /> Rate Dining Quality
              </span>
              <h3 className="text-xl font-black text-slate-950 mt-3">Share Your Review</h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">Rate your experience with: <strong>{feedbackTargetCatering.cateringName}</strong></p>
            </div>

            <form onSubmit={handleSubmitFeedback} className="space-y-5">
              
              {/* Star selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">Service Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isLit = star <= feedbackRating;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackRating(star)}
                        className="p-1 hover:scale-110 transition-transform focus:outline-none"
                      >
                        <Star 
                          className={`w-8 h-8 transition-colors ${
                            isLit ? "fill-amber-400 text-amber-400" : "text-slate-300"
                          }`} 
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Review text comment */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" /> Share your comments (optional)
                </label>
                <textarea
                  placeholder="Enter comments about meal taste, hot delivery, cleanliness..."
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-slate-800 min-h-[90px] leading-relaxed resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submittingFeedback}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-extrabold text-xs rounded-2xl shadow-md transition active:scale-[0.98] disabled:opacity-50"
              >
                {submittingFeedback ? "Submitting Review..." : "Confirm & Post Feedback"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- Receipt Invoice Modal --- */}
      {showReceipt && selectedOrder && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 md:p-8 shadow-2xl relative animate-scale-up my-8 max-h-[90vh] overflow-y-auto">
            
            {/* Header Success Checkmark */}
            <div className="flex flex-col items-center border-b border-dashed pb-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl shadow-inner mb-4">
                ✓
              </div>
              <h2 className="text-2xl font-black text-slate-800">Order Invoice</h2>
              <p className="text-slate-500 text-sm mt-1">
                {selectedOrder.payment?.paid ? "Proof of secure pre-paid payment transaction." : "Order placed via Pay Later option (Pending counter checkout)."}
              </p>
            </div>

            {/* Receipt Content Wrapper for Print/Format */}
            <div id="receipt-print-area" className="py-6 space-y-6">
              {/* Logo / Branch Title */}
              <div className="flex justify-between items-start text-left">
                <div>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-wide">
                    {selectedOrder.cateringId?.name || "CAMPUS CATERING"}
                  </h3>
                  <p className="text-slate-500 text-xs font-semibold mt-0.5">
                    {selectedOrder.branchId?.name || "Campus Branch"}
                  </p>
                  <p className="text-slate-400 text-[10px] italic">
                    {selectedOrder.branchId?.location || "University Campus"}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 text-[10px] font-extrabold rounded-full uppercase tracking-wider ${
                    selectedOrder.payment?.paid
                      ? "bg-emerald-100 text-emerald-800"
                      : selectedOrder.payment?.method === "PayLater"
                      ? "bg-amber-100 text-amber-800 animate-pulse"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {selectedOrder.payment?.paid ? (
                      selectedOrder.payment?.method === "Cash" ? "PAID (CASH)" :
                      selectedOrder.payment?.method === "Wallet" ? "PAID (WALLET)" :
                      "PAID (ONLINE)"
                    ) : selectedOrder.payment?.method === "PayLater" ? (
                      "⏱ PAY LATER AT COUNTER"
                    ) : (
                      "UNPAID"
                    )}
                  </span>
                  <p className="text-slate-450 text-xs font-mono mt-2">
                    {new Date(selectedOrder.createdAt).toLocaleDateString()} {new Date(selectedOrder.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {/* Receipt Details Metadata */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-xl p-4 border border-slate-100 text-sm text-left">
                <div>
                  <p className="text-slate-400 text-xs">Unique Bill No:</p>
                  <p className="font-mono text-slate-800 font-bold mt-0.5 text-xxs truncate">{selectedOrder._id}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Payment Reference:</p>
                  <p className="font-mono text-slate-800 font-bold mt-0.5 text-xxs truncate">
                    {selectedOrder.payment?.razorpayPaymentId || (selectedOrder.payment?.method === "PayLater" ? "PayLater (Cash/Counter)" : "N/A")}
                  </p>
                </div>
              </div>

              {/* Food Verification Token in Bill */}
              {!selectedOrder.payment?.paid ? (
                <div className="bg-amber-50 border border-amber-300 border-dashed rounded-xl p-4 text-center my-4">
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Food Verification Token</p>
                  <p className="text-3xl font-black text-amber-800 mt-1 tracking-wider">
                    {selectedOrder.tokenNumber || `TK-${selectedOrder._id.toString().slice(-4).toUpperCase()}`}
                  </p>
                  <p className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded mt-1.5 inline-block uppercase tracking-wider">
                    ⚠️ Unpaid - Pay at counter pickup
                  </p>
                  <p className="text-xxs text-slate-550 mt-1.5 font-semibold">Please complete payment at the counter to claim your food.</p>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 border-dashed rounded-xl p-4 text-center my-4 animate-pulse">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Food Verification Token</p>
                  <p className="text-3xl font-black text-emerald-800 mt-1 tracking-wider">
                    {selectedOrder.tokenNumber || `TK-${selectedOrder._id.toString().slice(-4).toUpperCase()}`}
                  </p>
                  <p className="text-xxs text-slate-550 mt-1 font-semibold">Show this token code at the counter to claim your food.</p>
                </div>
              )}

              {/* Items List Table */}
              <div className="text-left">
                <h4 className="font-bold text-slate-700 mb-3 border-b pb-1 text-sm uppercase">Order Summary</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm text-slate-800">
                      <div className="flex-1 min-w-0 pr-3">
                        <p className="font-bold truncate">{item.name}</p>
                        <p className="text-slate-400 text-xs mt-0.5">Qty: {item.quantity} @ ₹{item.price.toFixed(2)}</p>
                      </div>
                      <span className="font-bold text-slate-800 whitespace-nowrap">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Calculations including 5% GST */}
              <div className="border-t border-dashed pt-4 space-y-2 text-left">
                <div className="flex justify-between text-sm text-slate-650">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>CGST ({(taxRate / 2).toFixed(1)}%)</span>
                  <span>₹{(selectedOrder.total * (taxRate / 2 / 100)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500 border-b pb-2 border-dashed">
                  <span>SGST ({(taxRate / 2).toFixed(1)}%)</span>
                  <span>₹{(selectedOrder.total * (taxRate / 2 / 100)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-extrabold text-slate-800 pt-2">
                  <span>Grand Total (Incl. GST)</span>
                  <span className="text-green-700">₹{(selectedOrder.total * (1 + taxRate / 100)).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-xl transition flex items-center justify-center gap-2"
              >
                <span>🖨️</span> Print Invoice
              </button>
              <button
                onClick={() => {
                  setShowReceipt(false);
                  setSelectedOrder(null);
                }}
                className="flex-1 py-3 bg-green-500 text-white font-extrabold rounded-xl hover:bg-green-600 hover:scale-102 transition shadow-md flex items-center justify-center"
              >
                Close Receipt
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
