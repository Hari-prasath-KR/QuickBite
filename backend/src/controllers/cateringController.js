import Catering from "../models/catering.js";
import cloudinary from "../config/cloudinary.js";

// Add Catering
export const addCatering = async (req, res) => {
  try {
    const { name, description } = req.body;
    let logoUrl = "";

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "quickbite/caterings",
      });
      logoUrl = result.secure_url;
    }

    const catering = new Catering({ name, description, logo: logoUrl });
    await catering.save();

    res.status(201).json({ msg: "Catering added successfully", catering });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Get All Caterings
export const getCaterings = async (req, res) => {
  try {
    const caterings = await Catering.find();
    res.json(caterings);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Delete Catering
export const deleteCatering = async (req, res) => {
  try {
    const { id } = req.params;
    await Catering.findByIdAndDelete(id);
    res.json({ msg: "Catering deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// GET catering by ID
export const getCateringById = async (req, res) => {
  try {
    const catering = await Catering.findById(req.params.id);
    if (!catering) {
      return res.status(404).json({ message: "Catering not found" });
    }
    res.json(catering);
  } catch (err) {
    console.error("Error fetching catering by ID:", err);
    res.status(500).json({ message: "Server error" });
  }
};


