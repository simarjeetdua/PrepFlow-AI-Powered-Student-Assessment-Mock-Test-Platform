
import express from "express";

import {
  createQuestion,
  getQuestionsByTest,
  getAdminQuestionsByTest,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} from "../controllers/questionController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Admin and Teacher: Get questions with correct answers
router.get(
  "/admin/test/:testId",
  protect,
  authorizeRoles("admin", "teacher"),
  getAdminQuestionsByTest
);

// Students: Get questions without correct answers
router.get(
  "/test/:testId",
  protect,
  getQuestionsByTest
);

// Admin and Teacher: Create question
router.post(
  "/",
  protect,
  authorizeRoles("admin", "teacher"),
  createQuestion
);

// Admin and Teacher: Get single question
router.get(
  "/:id",
  protect,
  authorizeRoles("admin", "teacher"),
  getQuestionById
);

// Admin and Teacher: Update question
router.put(
  "/:id",
  protect,
  authorizeRoles("admin", "teacher"),
  updateQuestion
);

// Admin and Teacher: Delete question
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin", "teacher"),
  deleteQuestion
);

export default router;
