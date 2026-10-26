
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { getDashboardStats } from "../controllers/adminController.js";

const router = express.Router();

// Temporary authorization test
router.get("/test", protect, authorizeRoles("admin"), (req, res) => {
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

// Real dashboard statistics
router.get(
  "/dashboard/stats",
  protect,
  authorizeRoles("admin"),
  getDashboardStats
);

export default router;
