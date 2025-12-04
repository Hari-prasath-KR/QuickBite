import User from "../models/user.js";
import bcrypt from "bcryptjs";

export const createStaff = async (req, res) => {
  try {
    const { name, email, password, cateringId, branchId } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const staff = new User({
      name,
      email,
      password: hashedPassword,
      role: "staff",
      cateringId,
      branchId,
    });

    await staff.save();
    res.status(201).json({ message: "Staff created successfully", staff });
  } catch (error) {
    res.status(500).json({ message: "Error creating staff", error: error.message });
  }
};
