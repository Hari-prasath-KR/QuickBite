import express from "express";
import { addBranchAssignment, addGlobalMenuItem, deleteBranchAssignment, deleteGlobalMenuItem, getBranchAssignments, getGlobalMenu, updateBranchAssignment, updateGlobalMenuItem, getMenuByBranchPublic } from "../controllers/menuItemController.js";
import { requireAuth } from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.post('/add-item', requireAuth, upload.single('image'), addGlobalMenuItem);
router.get('/get-items', requireAuth, getGlobalMenu);
router.delete('/menu/:id', requireAuth, deleteGlobalMenuItem);
router.get('/menu/:id/branches', requireAuth, getBranchAssignments);
router.get('/public/branch/:branchId', getMenuByBranchPublic); // Public route
router.post('/branch-menu', requireAuth, addBranchAssignment);
router.put('/menu/:id', requireAuth, upload.single('image'), updateGlobalMenuItem);
router.put('/branch-menu/:id', requireAuth, updateBranchAssignment);
router.delete('/branch-menu/:id', requireAuth, deleteBranchAssignment);

export default router;
