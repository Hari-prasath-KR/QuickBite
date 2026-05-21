import User from "../models/user.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

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

export const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    let profilePhotoUrl = "";
    
    // Check if Cloudinary credentials are fully configured
    const isCloudinaryConfigured = 
      process.env.CLOUD_NAME && 
      process.env.CLOUD_KEY && 
      process.env.CLOUD_SECRET && 
      !process.env.CLOUD_NAME.includes("placeholder") &&
      !process.env.CLOUD_KEY.includes("placeholder");

    if (isCloudinaryConfigured) {
      try {
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "quickbite/profiles",
        });
        profilePhotoUrl = result.secure_url;
        console.log("Uploaded successfully to Cloudinary:", profilePhotoUrl);
      } catch (cloudinaryError) {
        console.warn("Cloudinary upload failed, falling back to local base64 storage:", cloudinaryError);
        // Fallback to base64 if Cloudinary fails
        const fileBuffer = await fs.promises.readFile(req.file.path);
        const mimeType = req.file.mimetype || "image/jpeg";
        profilePhotoUrl = `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
      }
    } else {
      console.log("Cloudinary credentials not configured. Using high-fidelity base64 sandbox fallback.");
      // Fallback to base64
      const fileBuffer = await fs.promises.readFile(req.file.path);
      const mimeType = req.file.mimetype || "image/jpeg";
      profilePhotoUrl = `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
    }

    // Clean up temporary local file
    if (req.file.path && fs.existsSync(req.file.path)) {
      try {
        await fs.promises.unlink(req.file.path);
      } catch (cleanupError) {
        console.warn("Failed to delete temporary file:", cleanupError);
      }
    }

    // Update user in database
    const userId = req.user.id;
    const user = await User.findByIdAndUpdate(
      userId,
      { profilePhotoUrl },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      message: isCloudinaryConfigured 
        ? "Profile photo uploaded successfully to Cloudinary" 
        : "Profile photo uploaded successfully (Sandbox Sandbox Mode)",
      url: profilePhotoUrl,
      user,
    });
  } catch (error) {
    console.error("Error uploading profile photo:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    // Check if email already exists for another user
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already taken by another account" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
