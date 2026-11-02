
import express from "express";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

import {
  getDashboardStats,
  getAllUsers,
  deleteUser,
  getStudentPerformance,
} from "../controllers/adminController.js";

const router = express.Router();

// ADMIN AUTHORIZATION TEST
router.get(
  "/test",
  protect,
  authorizeRoles("admin"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Admin authorization successful!",
      admin: {
        id: req.student._id,
        name: req.student.name,
        email: req.student.email,
        role: req.student.role,
      },
    });
  }
);

// ADMIN DASHBOARD STATISTICS
router.get(
  "/dashboard/stats",
  protect,
  authorizeRoles("admin"),
  getDashboardStats
);

// GET ALL REGISTERED USERS
router.get(
  "/users",
  protect,
  authorizeRoles("admin"),
  getAllUsers
);

// DELETE A USER
router.delete(
  "/users/:id",
  protect,
  authorizeRoles("admin"),
  deleteUser
);

// GET STUDENT PERFORMANCE
router.get(
  "/performance",
  protect,
  authorizeRoles("admin"),
  getStudentPerformance
);

export default router;
