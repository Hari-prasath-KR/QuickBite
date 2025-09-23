import mongoose from "mongoose";
import MenuItem from "../models/menuItem.js";

export const addMenuItem = async (req, res) => {
  try {
    const { cateringId, name, price, imageUrl } = req.body;
    if (!cateringId || !name || !price) {
      return res.status(400).json({ message: "cateringId, name, and price are required" });
    }
    const newItem = new MenuItem({cateringId,name,price,imageUrl});
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addMenuItemsBulk = async (req, res) => {
  try {
    const items = req.body; // expect an array of menu items
    const savedItems = await MenuItem.insertMany(items);
    res.status(201).json(savedItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};