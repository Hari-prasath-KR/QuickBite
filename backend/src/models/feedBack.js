import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    cateringId: { type: mongoose.Schema.Types.ObjectId, ref: "Catering" },
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    createdAt: { type: Date, default: Date.now },
})

const Feedback = new mongoose.model("Feedback",feedbackSchema);
export default Feedback;