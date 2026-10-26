import express from "express";

import {
    createQuestion,
    getQuestionsByTest,
    getQuestionById,
    updateQuestion,
    deleteQuestion,
} from "../controllers/questionController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create question
router.post("/", protect, createQuestion);

// Get all questions for a mock test
router.get("/test/:testId", protect, getQuestionsByTest);

// Get single question
router.get("/:id", protect, getQuestionById);

// Update question
router.put("/:id", protect, updateQuestion);

// Delete question
router.delete("/:id", protect, deleteQuestion);

export default router;