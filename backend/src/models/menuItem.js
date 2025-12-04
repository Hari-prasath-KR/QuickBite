import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema({
    cateringId: { type: mongoose.Schema.Types.ObjectId, ref: "Catering", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    imageUrl: { type: String },
    category: { type: String, default: 'Uncategorized' },
    defaultPrice: { type: Number, required: true },
    averageRating: {type: Number,default: 0},
    ratingCount: {type: Number,default: 0 }
}, { timestamps: true });

export const MenuItem = mongoose.model("MenuItem", menuItemSchema);

const branchMenuItemSchema = new mongoose.Schema({
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 0,  min: 0  },
    isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

export const  BranchMenuItem = mongoose.model("BranchMenuItem", branchMenuItemSchema);