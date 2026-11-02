
import express from "express";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

import {
  createVideo,
  getAllVideosForAdmin,
  getPublishedVideos,
  updateVideo,
  toggleVideoPublish,
  deleteVideo,
} from "../controllers/videoController.js";

const router = express.Router();

// Students can view published video lessons.
router.get(
  "/",
  protect,
  getPublishedVideos
);

// Admin and Teacher can view their management list.
router.get(
  "/admin",
  protect,
  authorizeRoles("admin", "teacher"),
  getAllVideosForAdmin
);

// Admin and Teacher can add videos.
router.post(
  "/",
  protect,
  authorizeRoles("admin", "teacher"),
  createVideo
);

// Admin and Teacher can edit videos they own.
router.put(
  "/:id",
  protect,
  authorizeRoles("admin", "teacher"),
  updateVideo
);

// Admin and Teacher can publish/unpublish videos they own.
router.patch(
  "/:id/publish",
  protect,
  authorizeRoles("admin", "teacher"),
  toggleVideoPublish
);

// Admin and Teacher can delete videos they own.
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin", "teacher"),
  deleteVideo
);

export default router;
