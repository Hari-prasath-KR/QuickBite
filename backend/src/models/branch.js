import mongoose from "mongoose";

const branchSchema =  new mongoose.Schema({
        cateringId: { type: mongoose.Schema.Types.ObjectId, ref: "Catering", required: true },
        name: { type: String, required: true },
        location: String,
        status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
},{ timestamps: true })

const Branch = new mongoose.model("Branch",branchSchema);
export default Branch;