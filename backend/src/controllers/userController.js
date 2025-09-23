import User from "../models/user.js";

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
