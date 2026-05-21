import Catering from "../models/catering.js";
import Branch from "../models/branch.js";
import { MenuItem, BranchMenuItem } from "../models/menuItem.js";

export const searchAll = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === "") {
      return res.json({ caterings: [], branches: [], dishes: [] });
    }

    const searchRegex = new RegExp(q.trim(), "i");

    // 1. Search Caterings by name/description
    const caterings = await Catering.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex }
      ]
    });

    // 2. Search Branches by name/location
    const branches = await Branch.find({
      $or: [
        { name: searchRegex },
        { location: searchRegex }
      ]
    }).populate("cateringId");

    // 3. Search Dishes (MenuItems) by name/category/description
    const dishes = await MenuItem.find({
      $or: [
        { name: searchRegex },
        { category: searchRegex },
        { description: searchRegex }
      ]
    }).populate("cateringId");

    // Find active and available branch mappings for these dishes
    const dishIds = dishes.map(d => d._id);
    const branchMenuItems = await BranchMenuItem.find({
      menuItemId: { $in: dishIds },
      isAvailable: true
    }).populate("branchId");

    // Map availability to each dish ID
    const dishAvailability = {};
    branchMenuItems.forEach(bmi => {
      if (bmi.branchId) {
        const dishIdStr = bmi.menuItemId.toString();
        if (!dishAvailability[dishIdStr]) {
          dishAvailability[dishIdStr] = [];
        }
        dishAvailability[dishIdStr].push({
          branchId: bmi.branchId._id,
          branchName: bmi.branchId.name,
          location: bmi.branchId.location,
          status: bmi.branchId.status,
          price: bmi.price,
          quantity: bmi.quantity
        });
      }
    });

    // Format dishes output
    const formattedDishes = dishes.map(d => {
      const dObj = d.toObject();
      dObj.availability = dishAvailability[d._id.toString()] || [];
      return dObj;
    });

    res.json({
      caterings,
      branches,
      dishes: formattedDishes
    });
  } catch (err) {
    console.error("Search API Error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
