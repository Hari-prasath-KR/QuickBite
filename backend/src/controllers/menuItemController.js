import mongoose from "mongoose";
import { BranchMenuItem, MenuItem } from "../models/menuItem.js";
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';
import Branch from "../models/branch.js";


export const addGlobalMenuItem = async (req, res) => {
    try {
        const { name, description, defaultPrice, category } = req.body;
        const cateringId = req.user.cateringId;
        if (!name || !defaultPrice || !category) {
            return res.status(400).json({ msg: 'Name, default price, and category are required.' });
        }
        const existingItem = await MenuItem.findOne({ name, cateringId });
        if (existingItem) {
            return res.status(409).json({ msg: 'An item with this name already exists.' });
        }
        let imageUrl = '';
        if (req.file) {
            try {
                const result = await cloudinary.uploader.upload(req.file.path);
                imageUrl = result.secure_url;
            } finally {
                fs.unlinkSync(req.file.path);
            }
        }
        const newItem = new MenuItem({ cateringId, name, description, defaultPrice, category, imageUrl, });
        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        console.error('Error adding global menu item:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};

export const getGlobalMenu = async (req, res) => {
    try {
        const cateringId = req.user.cateringId;
        const menuItems = await MenuItem.find({ cateringId }).lean();
        const menuWithBranchDetails = await Promise.all(
            menuItems.map(async (item) => {
                const branchItems = await BranchMenuItem.find({ menuItemId: item._id }).populate('branchId', '_id name');
                return { ...item, branchInfo: branchItems, };
            })
        );
        res.status(200).json(menuWithBranchDetails);
    } catch (error) {
        console.error('Error fetching menu with branch details:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};

export const getMenuByBranchPublic = async (req, res) => {
    try {
        const { branchId } = req.params;
        const branchMenuItems = await BranchMenuItem.find({ branchId, isAvailable: true })
            .populate('menuItemId')
            .lean();

        // Transform data to be more frontend-friendly if needed, or send as is
        // Currently sending BranchMenuItem objects which contain the MenuItem details in 'menuItemId'
        res.status(200).json(branchMenuItems);
    } catch (error) {
        console.error('Error fetching menu by branch:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};

export const deleteGlobalMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const menuItem = await MenuItem.findById(id);
        if (!menuItem) {
            return res.status(404).json({ msg: 'Menu item not found.' });
        }
        // 2. Delete image from Cloudinary if exists
        if (menuItem.imageUrl) {
            const publicId = menuItem.imageUrl.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }
        await BranchMenuItem.deleteMany({ menuItemId: id });
        await MenuItem.findByIdAndDelete(id);
        res.status(200).json({ msg: 'Menu item and all its branch associations have been deleted.' });
    } catch (error) {
        console.error('Error deleting global menu item:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};

export const getBranchAssignments = async (req, res) => {
    try {
        const { id: menuItemId } = req.params;
        const cateringId = req.user.cateringId;
        const allBranches = await Branch.find({ cateringId });
        const existingAssignments = await BranchMenuItem.find({ menuItemId }).populate('branchId', 'name');
        const assignedBranchIds = existingAssignments.map(a => a.branchId._id.toString());
        const unassignedBranches = allBranches.filter(
            branch => !assignedBranchIds.includes(branch._id.toString())
        );
        res.status(200).json({
            assignedBranches: existingAssignments,
            unassignedBranches: unassignedBranches,
        });

    } catch (error) {
        console.error("Error fetching branch assignments:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

export const addBranchAssignment = async (req, res) => {
    try {
        const { menuItemId, branchId, price, quantity } = req.body;
        if (!menuItemId || !branchId || !price || quantity === undefined) {
            return res.status(400).json({ msg: "All fields are required." });
        }
        const existingAssignment = await BranchMenuItem.findOne({ menuItemId, branchId });
        if (existingAssignment) {
            return res.status(409).json({ msg: "This item is already assigned to this branch." });
        }
        const newAssignment = new BranchMenuItem({ menuItemId, branchId, price, quantity, isAvailable: true });
        await newAssignment.save();
        res.status(201).json(newAssignment);
    } catch (error) {
        console.error("Error adding branch assignment:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

export const updateGlobalMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, defaultPrice, category } = req.body;
        const menuItem = await MenuItem.findById(id);
        if (!menuItem) {
            return res.status(404).json({ msg: "Menu item not found." });
        }
        const updates = { name, description, defaultPrice, category };
        if (req.file) {
            if (menuItem.imageUrl) {
                const publicId = menuItem.imageUrl.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            }
            const result = await cloudinary.uploader.upload(req.file.path);
            updates.imageUrl = result.secure_url;
            fs.unlinkSync(req.file.path);
        }
        const updatedMenuItem = await MenuItem.findByIdAndUpdate(id, updates, { new: true });
        res.status(200).json(updatedMenuItem);
    } catch (error) {
        console.error("Error updating global menu item:", error);
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: "Server Error" });
    }
};

export const updateBranchAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const { price, quantity } = req.body;
        if (price === undefined || quantity === undefined) {
            return res.status(400).json({ msg: "Price and quantity are required." });
        }
        const updatedAssignment = await BranchMenuItem.findByIdAndUpdate(id, { price, quantity }, { new: true }).populate('branchId', 'name');
        if (!updatedAssignment) {
            return res.status(404).json({ msg: "Assignment not found." });
        }
        res.status(200).json(updatedAssignment);
    } catch (error) {
        console.error("Error updating branch assignment:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

export const deleteBranchAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedAssignment = await BranchMenuItem.findByIdAndDelete(id);
        if (!deletedAssignment) {
            return res.status(404).json({ msg: "Assignment not found." });
        }
        res.status(200).json({ msg: "Assignment deleted successfully." });
    } catch (error) {
        console.error("Error deleting branch assignment:", error);
        res.status(500).json({ error: "Server Error" });
    }
};