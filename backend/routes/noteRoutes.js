
import express from "express";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

import {
  uploadNote,
  getAllNotesForAdmin,
  getPublishedNotes,
  toggleNotePublish,
  deleteNote,
} from "../controllers/noteController.js";

const router = express.Router();

// All authenticated users can view published notes.
router.get("/", protect, getPublishedNotes);

// Admin and Teacher can access the management list.
// The controller filters teacher results by ownership.
router.get(
  "/admin",
  protect,
  authorizeRoles("admin", "teacher"),
  getAllNotesForAdmin
);

// Admin and Teacher can upload PDFs.
router.post(
  "/",
  protect,
  authorizeRoles("admin", "teacher"),
  upload.single("file"),
  uploadNote
);

// Admin can manage all notes; Teacher can manage their own.
// Ownership is enforced inside the controller.
router.patch(
  "/:id/publish",
  protect,
  authorizeRoles("admin", "teacher"),
  toggleNotePublish
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin", "teacher"),
  deleteNote
);

export default router;
