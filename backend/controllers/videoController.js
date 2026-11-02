
import mongoose from "mongoose";
import VideoLesson from "../models/VideoLesson.js";

const isAdmin = (user) => user.role === "admin";

const canManageVideo = (user, video) =>
  isAdmin(user) ||
  video.uploadedBy.toString() === user._id.toString();

const isValidVideoUrl = (value) => {
  try {
    const url = new URL(value);

    const allowedHosts = [
      "youtube.com",
      "www.youtube.com",
      "m.youtube.com",
      "youtu.be",
      "www.youtu.be",
      "youtube-nocookie.com",
      "www.youtube-nocookie.com",
      "vimeo.com",
      "www.vimeo.com",
    ];

    return (
      url.protocol === "https:" &&
      allowedHosts.includes(url.hostname.toLowerCase())
    );
  } catch {
    return false;
  }
};

const validateVideoData = (data) => {
  const { title, subject, videoUrl, duration } = data;

  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof subject !== "string" ||
    !subject.trim()
  ) {
    return "Title and subject are required.";
  }

  if (title.trim().length > 150) {
    return "Title cannot exceed 150 characters.";
  }

  if (subject.trim().length > 100) {
    return "Subject cannot exceed 100 characters.";
  }

  if (
    typeof data.description === "string" &&
    data.description.length > 1000
  ) {
    return "Description cannot exceed 1000 characters.";
  }

  if (!isValidVideoUrl(videoUrl)) {
    return "Enter a valid HTTPS YouTube or Vimeo URL.";
  }

  if (
    duration !== undefined &&
    duration !== null &&
    (!Number.isFinite(Number(duration)) || Number(duration) < 0)
  ) {
    return "Duration must be zero or a positive number.";
  }

  return null;
};

const validateId = (id) => mongoose.isValidObjectId(id);

// POST /api/videos
// Admin and Teacher
export const createVideo = async (req, res) => {
  try {
    const {
      title,
      description = "",
      subject,
      videoUrl,
      duration,
    } = req.body;

    const validationError = validateVideoData({
      title,
      description,
      subject,
      videoUrl,
      duration,
    });

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const video = await VideoLesson.create({
      title: title.trim(),
      description: description.trim(),
      subject: subject.trim(),
      videoUrl: videoUrl.trim(),
      duration:
        duration === undefined || duration === ""
          ? null
          : Number(duration),
      uploadedBy: req.student._id,
      isPublished: false,
    });

    return res.status(201).json({
      success: true,
      message: "Video lesson added successfully as a draft.",
      video,
    });
  } catch (error) {
    console.error("Create Video Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create video lesson.",
    });
  }
};

// GET /api/videos/admin
// Admin sees all videos; Teacher sees their own.
export const getAllVideosForAdmin = async (req, res) => {
  try {
    const filter = isAdmin(req.student)
      ? {}
      : { uploadedBy: req.student._id };

    const videos = await VideoLesson.find(filter)
      .populate("uploadedBy", "name email role")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: videos.length,
      videos,
    });
  } catch (error) {
    console.error("Get Admin Videos Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch video lessons.",
    });
  }
};

// GET /api/videos
// Authenticated students see published videos only.
export const getPublishedVideos = async (req, res) => {
  try {
    const videos = await VideoLesson.find({
      isPublished: true,
    })
      .populate("uploadedBy", "name")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: videos.length,
      videos,
    });
  } catch (error) {
    console.error("Get Published Videos Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch published video lessons.",
    });
  }
};

// PUT /api/videos/:id
// Admin can edit all; Teacher can edit their own.
export const updateVideo = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid video ID.",
      });
    }

    const video = await VideoLesson.findById(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video lesson not found.",
      });
    }

    if (!canManageVideo(req.student, video)) {
      return res.status(403).json({
        success: false,
        message: "You can only edit videos you uploaded.",
      });
    }

    const {
      title,
      description = "",
      subject,
      videoUrl,
      duration,
    } = req.body;

    const validationError = validateVideoData({
      title,
      description,
      subject,
      videoUrl,
      duration,
    });

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    video.title = title.trim();
    video.description = description.trim();
    video.subject = subject.trim();
    video.videoUrl = videoUrl.trim();

    video.duration =
      duration === undefined || duration === ""
        ? null
        : Number(duration);

    await video.save();

    return res.status(200).json({
      success: true,
      message: "Video lesson updated successfully.",
      video,
    });
  } catch (error) {
    console.error("Update Video Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update video lesson.",
    });
  }
};

// PATCH /api/videos/:id/publish
export const toggleVideoPublish = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid video ID.",
      });
    }

    const video = await VideoLesson.findById(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video lesson not found.",
      });
    }

    if (!canManageVideo(req.student, video)) {
      return res.status(403).json({
        success: false,
        message: "You can only manage videos you uploaded.",
      });
    }

    video.isPublished = !video.isPublished;

    await video.save();

    return res.status(200).json({
      success: true,
      message: video.isPublished
        ? "Video lesson published successfully."
        : "Video lesson unpublished successfully.",
      video,
    });
  } catch (error) {
    console.error("Toggle Video Publish Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update video publication status.",
    });
  }
};

// DELETE /api/videos/:id
export const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid video ID.",
      });
    }

    const video = await VideoLesson.findById(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video lesson not found.",
      });
    }

    if (!canManageVideo(req.student, video)) {
      return res.status(403).json({
        success: false,
        message: "You can only delete videos you uploaded.",
      });
    }

    await video.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Video lesson deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Video Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete video lesson.",
    });
  }
};
