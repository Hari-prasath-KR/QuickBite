import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CustomerNavbar from "../components/CustomerNavbar";

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

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/order/customer", {
          withCredentials: true,
        });
        setOrders(res.data);
      } catch (err) {
        console.error("Error fetching order history:", err);
        // If unauthorized, redirect to login
        if (err.response && err.response.status === 401) {
          alert("Please login to view your order history.");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, [navigate]);

  const openReceipt = (order) => {
    setSelectedOrder(order);
    setShowReceipt(true);
  };

  const getStatusBadgeClass = (status) => {
    const s = String(status).toLowerCase();
    if (s === "completed") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (s === "in progress" || s === "preparing") {
      return "bg-amber-50 text-amber-700 border-amber-200 animate-pulse";
    }
    if (s === "ready for service" || s === "ready") {
      return "bg-sky-50 text-sky-700 border-sky-200";
    }
    if (s === "cancelled") {
      return "bg-slate-100 text-slate-600 border-slate-200";
    }
    return "bg-rose-50 text-rose-700 border-rose-200";
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
      <div className="fixed top-0 left-0 w-full z-50 shadow-lg">
        <CustomerNavbar />
      </div>

      <div className="pt-28 px-4 md:px-8 pb-16 container mx-auto max-w-5xl">
        {/* Page Header */}
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/50 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Your Order History 📜</h1>
            <p className="text-slate-600 text-sm mt-1">Keep track of your campus meals, payment receipts, and statuses.</p>
          </div>
          <button
            onClick={() => navigate("/customer")}
            className="px-5 py-2.5 bg-green-500 text-white font-extrabold rounded-xl hover:bg-green-600 active:scale-95 shadow transition-all duration-300"
          >
            🍕 Order Food
          </button>
        </div>

        {/* Orders Listing */}
        {orders.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-md rounded-3xl p-16 text-center border border-white/50 shadow-lg">
            <span className="text-6xl">🍲</span>
            <h3 className="text-2xl font-bold text-slate-700 mt-4">No Orders Placed Yet</h3>
            <p className="text-slate-500 mt-2 max-w-md mx-auto">
              Skip the queues at college caterings. Go choose your meals and complete your first secure payment.
            </p>
            <button
              onClick={() => navigate("/customer")}
              className="mt-6 px-8 py-3 bg-yellow-500 text-white font-extrabold rounded-xl hover:bg-yellow-600 shadow-md transition-all"
            >
              Order Delicious Food Now!
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl shadow-md border border-slate-100 p-5 md:p-6 transition hover:shadow-lg flex flex-col md:flex-row justify-between gap-6"
              >
                {/* Order Meta & Items */}
                <div className="flex-1 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
                    {/* Left: Ref & Date */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 font-bold text-xs uppercase bg-slate-100 text-slate-700 rounded-full">
                        Ref: {order._id.substring(order._id.length - 8).toUpperCase()}
                      </span>
                      <span className="text-slate-400 text-xs font-semibold font-mono">
                        📅 {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Right: Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-3 py-1 border text-xs font-black rounded-full uppercase tracking-wider ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                      <span className={`px-3 py-1 border text-xs font-black rounded-full uppercase tracking-wider ${
                        order.payment?.paid
                          ? "bg-green-50 text-green-700 border-green-200"
                          : order.payment?.method === "PayLater"
                          ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}>
                        {order.payment?.paid
                          ? "💳 Paid Online"
                          : order.payment?.method === "PayLater"
                          ? "⏱ Pay Later at Counter"
                          : "💵 Unpaid"}
                      </span>
                    </div>
                  </div>

                  {/* Stepper or Cancelled Banner */}
                  <div className="py-2 mb-2">
                    {String(order.status).toLowerCase() === "cancelled" ? (
                      <div className="w-full bg-rose-50 border border-rose-100 text-rose-800 rounded-xl p-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">🛑</span>
                          <div>
                            <h4 className="font-extrabold text-xs uppercase tracking-wider text-rose-900">Order Cancelled</h4>
                            <p className="text-rose-500 text-[10px] mt-0.5 font-semibold">This order was cancelled by the staff.</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-200 text-[9px] font-black tracking-widest uppercase rounded-full">
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
                    <p className="text-slate-500 text-sm mt-0.5">
                      📍 {order.branchId?.name || "Main Branch"} ({order.branchId?.location || "Campus"})
                    </p>
                  </div>

                  {/* Summary of Items */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Items Summary</p>
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
                <div className="flex flex-col justify-between items-start md:items-end border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 min-w-[160px]">
                  <div className="md:text-right space-y-1">
                    <p className="text-slate-400 text-xs font-semibold">
                      {order.payment?.paid ? "Grand Total paid" : "Grand Total (Pay at Counter)"}
                    </p>
                    <p className="text-2xl font-black text-green-600">₹{(order.total * 1.05).toFixed(2)}</p>
                    <p className="text-slate-400 text-xxs italic">Includes 5% GST (₹{(order.total * 0.05).toFixed(2)})</p>
                  </div>

                  <button
                    onClick={() => openReceipt(order)}
                    className="w-full mt-4 md:mt-0 py-2.5 px-4 bg-yellow-500 text-white font-extrabold rounded-xl hover:bg-yellow-600 hover:scale-103 active:scale-97 transition-all text-sm shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <span>🧾</span> View Bill Invoice
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🧾 BEAUTIFUL FORMAL DIGITAL INVOICE RECEIPT POPUP (Exact copy of OrderPage Invoice) */}
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
                {selectedOrder.payment?.paid ? "Proof of secure online transaction payment." : "Order placed via Pay Later option (Pending counter checkout)."}
              </p>
            </div>

            {/* Receipt Content Wrapper for Print/Format */}
            <div id="receipt-print-area" className="py-6 space-y-6">
              {/* Logo / Branch Title */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-wide">
                    {selectedOrder.cateringId?.name || "CAMPUS CATERING"}
                  </h3>
                  <p className="text-slate-500 text-xs font-semibold mt-0.5">
                    {selectedOrder.branchId?.name || "Campus Branch"}
                  </p>
                  <p className="text-slate-400 text-xxs italic">
                    {selectedOrder.branchId?.location || "University Campus"}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 text-xs font-extrabold rounded-full uppercase tracking-wider ${
                    selectedOrder.payment?.paid
                      ? "bg-emerald-100 text-emerald-800"
                      : selectedOrder.payment?.method === "PayLater"
                      ? "bg-amber-100 text-amber-800 animate-pulse"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {selectedOrder.payment?.paid
                      ? "PAID ONLINE"
                      : selectedOrder.payment?.method === "PayLater"
                      ? "⏱ PAY LATER AT COUNTER"
                      : "UNPAID"}
                  </span>
                  <p className="text-slate-400 text-xs font-mono mt-2">
                    {new Date(selectedOrder.createdAt).toLocaleDateString()} {new Date(selectedOrder.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {/* Receipt Details Metadata */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-xl p-4 border border-slate-100 text-sm">
                <div>
                  <p className="text-slate-400 text-xs">Unique Bill No:</p>
                  <p className="font-mono text-slate-800 font-bold mt-0.5">{selectedOrder._id}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Payment Reference:</p>
                  <p className="font-mono text-slate-800 font-bold mt-0.5 text-ellipsis overflow-hidden">
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
                  <p className="text-xxs text-slate-500 mt-1.5 font-semibold">Please complete payment at the counter to claim your food.</p>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 border-dashed rounded-xl p-4 text-center my-4 animate-pulse">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Food Verification Token</p>
                  <p className="text-3xl font-black text-emerald-800 mt-1 tracking-wider">
                    {selectedOrder.tokenNumber || `TK-${selectedOrder._id.toString().slice(-4).toUpperCase()}`}
                  </p>
                  <p className="text-xxs text-slate-500 mt-1 font-semibold">Show this token code at the counter to claim your food.</p>
                </div>
              )}

              {/* Items List Table */}
              <div>
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
              <div className="border-t border-dashed pt-4 space-y-2">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>CGST (2.5%)</span>
                  <span>₹{(selectedOrder.total * 0.025).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500 border-b pb-2 border-dashed">
                  <span>SGST (2.5%)</span>
                  <span>₹{(selectedOrder.total * 0.025).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-extrabold text-slate-800 pt-2">
                  <span>Grand Total (Incl. GST)</span>
                  <span className="text-green-700">₹{(selectedOrder.total * 1.05).toFixed(2)}</span>
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
