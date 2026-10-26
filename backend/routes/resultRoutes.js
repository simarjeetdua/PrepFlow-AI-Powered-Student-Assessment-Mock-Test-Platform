import express from "express";

import {
    submitTest,
    getResultById,
    getMyResults,
} from "../controllers/resultController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Submit a mock test
router.post("/", protect, submitTest);

// Get all results of logged-in student
router.get("/my", protect, getMyResults);

// Get a specific result
router.get("/:id", protect, getResultById);

export default router;