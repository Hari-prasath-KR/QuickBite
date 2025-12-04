import User from "../models/user.js";
import Catering from "../models/catering.js";
import Order from "../models/order.js";
import mongoose from "mongoose";
import Branch from "../models/branch.js";
import bcrypt from "bcryptjs";

const calculateAnalytics = async (cateringId) => {
  const orders = await Order.find({ cateringId: cateringId });

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay())); // Sunday
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const revenue = {
    today: { amount: 0, percentageChange: 0 },
    weekly: { amount: 0, percentageChange: 0 },
    monthly: { amount: 0, percentageChange: 0 },
  };

  orders.forEach(order => {
    const orderDate = new Date(order.createdAt);
    if (orderDate >= startOfToday) revenue.today.amount += order.total;
    if (orderDate >= startOfWeek) revenue.weekly.amount += order.total;
    if (orderDate >= startOfMonth) revenue.monthly.amount += order.total;
  });

  const topDishesMap = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      if (!topDishesMap[item.name]) topDishesMap[item.name] = 0;
      topDishesMap[item.name] += item.quantity;
    });
  });

  const topDishes = Object.keys(topDishesMap)
    .map(name => ({ dish: name, count: topDishesMap[name] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 7);

 const branches = await Catering.findById(cateringId).populate("branches");
  const branchesPie = branches.branches.map(branch => ({
    name: branch.name,
    revenue: orders
      .filter(o => o.branch.toString() === branch._id.toString())
      .reduce((sum, o) => sum + o.total, 0),
  }));

  return { revenue, topDishes, branches: branches.branches, branchesPie };
};

export const getCateringAnalytics = async (req, res) => {
  try {
    const adminUser = await User.findById(req.user._id);
    if (!adminUser || !adminUser.cateringId) {
      return res.status(404).json({ error: "This admin user is not linked to a catering company." });
    }
    const catering = await Catering.findById(adminUser.cateringId);
    if (!catering) {
      console.error("4. A catering company was NOT found for the ID:", adminUser.cateringId);
      return res.status(404).json({ error: "Catering company does not exist for the linked ID." });
    }
    const analytics = await calculateAnalytics(catering._id);
    res.json({ catering, analytics });

  } catch (err) {
    console.error("CRITICAL ERROR in getCateringAnalytics:", err);
    res.status(500).json({ error: "Server Error" });
  }
};


export const getAllBranches = async (req, res) => {
  try {
    const adminUser = await User.findById(req.user._id);
    if (!adminUser || !adminUser.cateringId) {
      return res.status(403).json({ error: "This admin user is not linked to a catering company." });
    }
    const branches = await Branch.find({ cateringId: adminUser.cateringId });
    res.json(branches);

  } catch (error) {
    console.error("CRITICAL ERROR in getAllBranches:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

export const deleteBranchById = async (req, res) => {
  try {
     const branchId = req.params.id;
     if (!mongoose.Types.ObjectId.isValid(branchId)) {
      return res.status(400).json({ error: "Invalid branch ID" });
     }
     const branch = await Branch.findByIdAndDelete(branchId);
     if (!branch) {
      return res.status(404).json({ error: "Branch not found" });
     }
    return res.status(200).json({ message: "Branch deleted successfully" });
  } catch (error) {
    console.error("CRITICAL ERROR in deleteBranchById:", error);
    res.status(500).json({ error: "Server Error" });
  }
}

export const addBranch = async (req, res) => {
  try {
    const { branchName, location } = req.body;
    const cateringId = req.user.cateringId; 
    if (!cateringId) {
      return res.status(401).json({ msg: "Unauthorized: cateringId missing" });
    }
    const newBranch = new Branch({name: branchName,location,cateringId,});
    await newBranch.save();
    res.status(201).json({ msg: "Branch added successfully", branch: newBranch });
  } catch (err) {
    console.error("Error adding branch:", err);
    res.status(500).json({ msg: err.message });
  }
};

export const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, status } = req.body;
    if (!name || !location) {
      return res.status(400).json({ msg: "Name and location are required." });
    }
    const updatedBranch = await Branch.findByIdAndUpdate(
      id,
      { name, location, status },
      { new: true } // This option returns the updated document
    );
    if (!updatedBranch) {
      return res.status(404).json({ msg: "Branch not found." });
    }
    res.json(updatedBranch);
  } catch (error) {
    console.error("Error updating branch:", error);
    res.status(500).json({ error: "Server Error" });
  }
};


export const getAllStaff = async (req, res) => {
  try {
    const staffMembers = await User.find({ 
      cateringId: req.user.cateringId, 
      role: 'staff' 
    }).populate('branchId', 'name');
    res.json(staffMembers);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

export const deleteStaff = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ msg: "Staff member not found." });
    }
    res.json({ msg: "Staff member deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

export const updateStaff = async (req, res) => {
  try {
    const { name, email, branchId } = req.body;
    const updatedStaff = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, branchId },
      { new: true }
    ).populate('branchId', 'name');
    res.json(updatedStaff);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

export const addStaff = async (req, res) => {
  try {
 
    const { name, email, password, branchId } = req.body;
    const cateringId = req.user.cateringId;
    if (!cateringId) {
      return res.status(403).json({ msg: "Admin is not associated with a catering company." });
    }
    if (!name || !email || !password || !branchId) {
      return res.status(400).json({ msg: "Please provide all required fields." });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ msg: "A user with this email already exists." });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ name,email, password: hashedPassword, role: 'staff',cateringId, branchId,});
    const savedUser = await newUser.save();
    res.status(201).json({ msg: "Staff member created successfully", user: savedUser });
  } catch (error) {
    console.error("Error creating staff member:", error);
    res.status(500).json({ error: "Server Error" });
  }
};