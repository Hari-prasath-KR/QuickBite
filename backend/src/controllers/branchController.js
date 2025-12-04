import Branch from "../models/branch.js";
import Catering from "../models/catering.js"
import mongoose from "mongoose";

export const addBranch = async (req, res) => {
  try {
    const { cateringId, name, location } = req.body;
    if (!cateringId || !name) return res.status(400).json({ msg: "Missing fields" });
    const catering = await Catering.findById(cateringId);
    if (!catering) return res.status(404).json({ msg: "Catering not found" });
    const branch = new Branch({ cateringId, name, location });
    await branch.save();
    return res.status(201).json(branch);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export const getBranchesByCatering = async (req, res) => {
  try {
    const { cateringId } = req.params;
    const branches = await Branch.find({ cateringId });
    return res.json(branches);
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

export const getBranchesByCateringPublic = async (req, res) => {
  try {
    const { cateringId } = req.params;
    const branches = await Branch.find({ cateringId, status: 'Active' });
    return res.json(branches);
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

export const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const removed = await Branch.findByIdAndDelete(id);
    if (!removed) return res.status(404).json({ msg: "Branch not found" });
    return res.json({ msg: "Branch deleted" });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};