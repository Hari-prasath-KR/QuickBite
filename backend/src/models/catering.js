import mongoose from "mongoose";

const cateringschema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    description:{
        type:String
    },
    logo:{
        type:String
    },
    admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // refers to User model
    default: null, // initially no catering admin
  },
   branches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch'
  }],
}, { timestamps: true });

const Catering = mongoose.model("Catering",cateringschema);
export default Catering;