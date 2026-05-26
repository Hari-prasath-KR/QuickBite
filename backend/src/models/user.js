import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  logo:{
        type:String
  },
  profilePhotoUrl: {
        type: String,
        default: ""
  },
  role: {
    type: String,
    enum: ["customer", "staff", "cateringAdmin", "collegeAdmin"],
    default: "customer",
  },
  cateringId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Catering",
    default: null,
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    default: null,
  },
  walletBalance: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });


userSchema.index(
   {role:1,cateringId:1},
   {unique:true,partialFilterExpression:{role:"cateringAdmin"}}
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
