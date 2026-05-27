import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Order from "../models/order.js";
import Branch from "../models/branch.js";
import Catering from "../models/catering.js";
import SystemSetting from "../models/systemSetting.js";


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
    
    // Fetch global configuration for default starter wallet credit balance
    const settings = await SystemSetting.findOne({ key: "global_config" });
    const starterCredits = settings ? settings.starterCredits : 500;

    const user = new User({
      name,
      email,
      password: hashedpass,
      role: "customer",
      walletBalance: starterCredits
    });

    await user.save();
    res.status(201).json({ message: "Customer Registered Successfully" });

  } catch (error) {
    console.error("🔥 Register error:", error);
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
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("JWT_TOKEN_QUICKBITE", token, {
      httpOnly: true, // secure, not accessible by JS
      secure: isProd, // true in production
      sameSite: isProd ? "none" : "lax",
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
    if (!token)
      return res.status(401).json({ msg: "Unauthorized: No token provided" });

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const orderCount = await Order.countDocuments({ userId: decoded.id });
    const userObj = user.toObject();
    userObj.orderCount = orderCount;

    if (user.branchId) {
      const branchObj = await Branch.findById(user.branchId);
      if (branchObj) {
        userObj.branchName = branchObj.name;
      }
    }
    if (user.cateringId) {
      const cateringObj = await Catering.findById(user.cateringId);
      if (cateringObj) {
        userObj.cateringName = cateringObj.name;
      }
    }

    res.json({ data: userObj });

  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(401).json({ msg: "Unauthorized: Invalid or expired token" });
    }

    res.status(500).json({ msg: "Server error", error: err.message });
  }
};


export const logout = (req, res) => {
  try {
    const isProd = process.env.NODE_ENV === "production";
    // Must match the name and options used in login
    res.clearCookie("JWT_TOKEN_QUICKBITE", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
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

// Google Login/Register Handler
export const googleLogin = async (req, res) => {
  try {
    let { name, email, googleId, credential } = req.body;

    if (credential) {
      // Validate dynamic token with Google's secure APIs
      try {
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
        if (!verifyRes.ok) {
          return res.status(400).json({ message: "Google Authentication Token is invalid or has expired." });
        }
        const payload = await verifyRes.json();
        email = payload.email;
        name = payload.name || payload.given_name || email.split("@")[0];
        googleId = payload.sub;
      } catch (err) {
        console.error("🔥 Cryptographic verification failed for Google token:", err);
        return res.status(400).json({ message: "Failed to securely verify Google token with Google servers." });
      }
    }

    if (!email) {
      return res.status(400).json({ message: "Email is required for Google Sign-in" });
    }

    let user = await User.findOne({ email });


    if (!user) {
      // Auto-register a new customer user
      const randomPassword = Math.random().toString(36).slice(-12) + "A1!";
      const hashedpass = await bcrypt.hash(randomPassword, 10);
      
      const settings = await SystemSetting.findOne({ key: "global_config" });
      const starterCredits = settings ? settings.starterCredits : 500;

      user = new User({
        name: name || email.split("@")[0],
        email,
        password: hashedpass,
        role: "customer",
        walletBalance: starterCredits
      });

      await user.save();
      console.log(`🆕 Google user auto-registered: ${email}`);

    }

    // Sign the standard JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    const isProd = process.env.NODE_ENV === "production";
    res.cookie("JWT_TOKEN_QUICKBITE", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.json({ token, role: user.role, userId: user._id, name: user.name });
  } catch (error) {
    console.error("🔥 Google Login error:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
