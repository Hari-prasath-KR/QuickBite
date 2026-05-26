import User from "../models/user.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import bcrypt from "bcryptjs";

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password"); //except pass select all the things

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update user details (name, email, password)
export const updateProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (name) user.name = name;
    
    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== userId.toString()) {
        return res.status(400).json({ success: false, message: "Email is already taken" });
      }
      user.email = email;
    }

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// Upload/Update profile photo to Cloudinary
export const updateProfilePhoto = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // 1. Delete old profile image from Cloudinary if exists
    if (user.profilePhotoUrl) {
      try {
        const publicId = user.profilePhotoUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (destroyErr) {
        console.error("Failed to destroy old Cloudinary image:", destroyErr);
      }
    }

    // 2. Upload new image
    let imageUrl = '';
    try {
      const result = await cloudinary.uploader.upload(req.file.path);
      imageUrl = result.secure_url;
    } finally {
      fs.unlinkSync(req.file.path);
    }

    user.profilePhotoUrl = imageUrl;
    await user.save();

    res.json({ success: true, url: imageUrl });
  } catch (err) {
    console.error("Error uploading profile photo:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
