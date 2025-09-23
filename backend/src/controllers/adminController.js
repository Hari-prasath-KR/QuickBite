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
