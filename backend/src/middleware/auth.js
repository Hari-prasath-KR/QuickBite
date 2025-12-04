import jwt from "jsonwebtoken";
import User from "../models/user.js";
import dotenv from "dotenv";
dotenv.config();

const { JWT_SECRET } = process.env;
export const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies.JWT_TOKEN_QUICKBITE;
    if (!token) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
        return res.status(401).json({ msg: "User not found, authorization denied" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ msg: "Invalid or expired token" });
  }
};

//allow only main admin
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ msg: "Unauthorized" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Access denied" });
  }
  next();
};
