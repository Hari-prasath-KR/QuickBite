import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema({
    cateringId: { type: mongoose.Schema.Types.ObjectId, ref: "Catering", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: String,
    createdAt: { type: Date, default: Date.now },
})

const MenuItem = mongoose.model("MenuItem",menuItemSchema);

export default MenuItem;