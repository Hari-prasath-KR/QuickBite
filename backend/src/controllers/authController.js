import User from "../models/user.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config();
//console.log("JWT_SECRET from env:", process.env.JWT_SECRET);
const {JWT_SECRET} = process.env; 

//Register-Only for Customer
export const register = async(req,res)=>{
          try {
            const {name,email,password}=req.body;
            
            const existinguser= await User.findOne({email});

            if(existinguser){
                return res.status(400).json({message:"Email Already Exits"});
            }
            
            const hashedpass = await bcrypt.hash(password,10);

            const user= new User({
                name,email,password:hashedpass,role:"customer",
            });

            await user.save();
            res.status(201).json({message:"Customer Registered Successfully"});

          } catch (error) {
            res.status(500).json({message:"Internal Server Error",error:error.message});
          }
}

export const login = async(req,res)=>{
    try {
        const {email,password}= req.body;
        
        const user=await User.findOne({email});

        if(!user){
            return res.status(400).json({message:"User not found"});
        }
        
        const passcheck = await bcrypt.compare(password,user.password);

        if(!passcheck) {
            return res.status(400).json({message:"Invalid Credentials"});
        }

        //important part
        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
            expiresIn: "7d",
        });
        res.json({token,role:user.role,userId:user._id,name:user.name});
    
    } catch (error) {
          console.error("🔥 Login error:", error);
        res.status(500).json({message:"Internal Server Error",error:error.message});
    }
}