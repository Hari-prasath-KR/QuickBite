import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
//console.log("JWT_SECRET from env:", process.env.JWT_SECRET);
const { JWT_SECRET } = process.env;

//Register-Only for Customer
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existinguser = await User.findOne({ email });

    if (existinguser) {
      return res.status(400).json({ message: "Email Already Exits" });
    }

    const hashedpass = await bcrypt.hash(password, 10);
    console.log("Hashed Password:", hashedpass);
    const user = new User({
      name,
      email,
      password: hashedpass,
      role: "customer",
    });

    await user.save();
    res.status(201).json({ message: "Customer Registered Successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
//login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const passcheck = await bcrypt.compare(password, user.password);

    if (!passcheck) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    //important part
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("JWT_TOKEN_QUICKBITE", token, {
      httpOnly: true, // secure, not accessible by JS
      secure: process.env.NODE_ENV === "production", // true in production
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    res.json({ token, role: user.role, userId: user._id, name: user.name });
  } catch (error) {
    console.error("🔥 Login error:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
export const getProfile = async (req, res) => {
  try {
    const token = req.cookies.JWT_TOKEN_QUICKBITE;

    if (!token) return res.status(401).json({ msg: "Unauthorized" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server error", err });
  }
};

export const logout = (req, res) => {
  try {
    // Must match the name and options used in login
    res.clearCookie("JWT_TOKEN_QUICKBITE", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/", // include path to be safe
    });
    res.status(200).json({
      success: true,
      message: "Logout Successful...",
    });
  } catch (error) {
    console.log("Logout Error:", error);

    res.status(500).json({
      success: false,
      message: `Error: Logout Failed...`,
    });
  }
};
