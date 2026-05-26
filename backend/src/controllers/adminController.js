import User from "../models/user.js";
import Caterings from "../models/catering.js"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import bcrypt from "bcryptjs";
import mongoose from "mongoose";


dotenv.config();

export const getUnassignedCaterings  = async(req,res) =>{
       try {
           const assigned = await User.find({role:"cateringAdmin",cateringId:{$ne: null}}).select("cateringId");
           const assignedIDs = assigned.map(a=>a.cateringId.toString());
           const unassigned = await Caterings.find({_id:{$nin:assignedIDs}});
           res.json(unassigned);
       } catch (error) {
         res.status(500).json({ msg: "Server error", error: err.message });
       } 
}

export const addCateringAdmin = async(req,res) =>{
    try {
         const{name,email,password,cateringId}=req.body;

         if(!name||!email||!password||!cateringId)
            return res.status(400).json({message:"All feilds are required"});

        const catering =  await Caterings.findById(cateringId);
        if(!catering) 
            return res.status(404).json({message:"Catering not found"});

        const cateringexit = await User.findOne({role:"cateringAdmin",cateringId: new mongoose.Types.ObjectId(cateringId),});
        if(cateringexit){
           return  res.status(400).json({message:"This catering already has admin"});
        }

        const existinguser = await User.findOne({email});
        if(existinguser){
            return res.status(400).json({message:"Email already Exit"});
        }

        const hashedpassword = await bcrypt.hash(password,10);
        const newadmin = new User({
            name,email,password:hashedpassword,role:"cateringAdmin",cateringId
        });

        catering.admin = newadmin._id;
          await catering.save();

        await newadmin.save();
        res.status(201).json({msg: "Catering admin created successfully",
        admin: { id: newadmin._id, name: newadmin.name, email: newadmin.email },
        });

    } catch (error) {
        if(error.code==11000){
            return res.status(400).json({message:"This catering already has a admin",error:error.message});
        }
        res.status(500).json({message:"Internal Server error",error:error.message});
    }
}

export const getAllCateringAdmins = async (req,res) =>{
      try {
        const admins = await User.find({role:"cateringAdmin"}).populate(
            "cateringId",// must match your User schema -same as your schema
            "name description logo"
        );
        res.json(admins);
      } catch (error) {
         res.status(500).json({ message: "Error fetching admins", error: error.message });
      }
}

export const deleteCateringAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const admin = await User.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "Catering admin deleted, catering is now free" });
  } catch (error) {
    res.status(500).json({ message: "Error Deleting admin", error: error.message });
  }
};

// Get all users with optional filtering and search
export const getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = {};

    if (role && role !== "all") {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .populate("cateringId", "name")
      .populate("branchId", "name");

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching system users", error: error.message });
  }
};

// Update a user's wallet balance
export const updateUserWallet = async (req, res) => {
  try {
    const { id } = req.params;
    const { walletBalance } = req.body;

    if (walletBalance === undefined || isNaN(Number(walletBalance))) {
      return res.status(400).json({ message: "Valid wallet balance is required" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.walletBalance = Number(walletBalance);
    await user.save();

    res.json({ message: "Wallet balance updated successfully", walletBalance: user.walletBalance });
  } catch (error) {
    res.status(500).json({ message: "Error updating wallet balance", error: error.message });
  }
};

// Update a user's role
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ["customer", "staff", "cateringAdmin", "collegeAdmin"];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role;
    
    // Reset catering/branch links if they are not staff/cateringAdmin anymore
    if (role === "customer" || role === "collegeAdmin") {
      user.cateringId = null;
      user.branchId = null;
    }

    await user.save();

    res.json({ message: "User role updated successfully", role: user.role });
  } catch (error) {
    res.status(500).json({ message: "Error updating user role", error: error.message });
  }
};

// Delete a user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Don't allow deleting the active admin themselves
    if (user._id.toString() === req.user?._id?.toString()) {
      return res.status(400).json({ message: "You cannot delete your own admin account" });
    }

    await User.findByIdAndDelete(id);
    res.json({ message: "User account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user account", error: error.message });
  }
};

