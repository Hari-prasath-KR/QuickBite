import { BranchMenuItem } from "../models/menuItem.js";
export const getMenuByBranch = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { all } = req.query;

    const filter = { branchId };
    if (all !== "true") {
      filter.isAvailable = true;
    }

    const menuItems = await BranchMenuItem.find(filter)
      .populate({
        path: "menuItemId",
        model: "MenuItem",
        select: "name description imageUrl category defaultPrice cateringId"
      });

    return res.json(menuItems);
  } catch (err) {
    console.error("getMenuByBranch error:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

