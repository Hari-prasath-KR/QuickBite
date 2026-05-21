import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
    name: String,
    price: Number,
    quantity: Number,
})

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    cateringId: { type: mongoose.Schema.Types.ObjectId, ref: "Catering" },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", default: null },
    items: [orderItemSchema],
    total: { type: Number, required: true },
    status: { type: String, default: "pending" }, // pending, preparing, completed
    table: { type: String, default: "" },
    customerName: { type: String, default: "" },
    tokenNumber: { type: String, default: "" },
    payment: {
        method: String,
        razorpayOrderId: String,
        razorpayPaymentId: String,
        paid: { type: Boolean, default: false },
    },
}, { timestamps: true });


const Order = new mongoose.model("Order", orderSchema);
export default Order;