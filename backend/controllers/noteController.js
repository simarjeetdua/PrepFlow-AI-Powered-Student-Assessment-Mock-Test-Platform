
import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.js";
import Note from "../models/Note.js";

const isAdmin = (user) => user.role === "admin";

const canManageNote = (user, note) =>
  isAdmin(user) ||
  note.uploadedBy.toString() === user._id.toString();

const uploadPdfToCloudinary = (file) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "prepflow/notes",
        public_id: randomUUID(),
        format: "pdf",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    Readable.from(file.buffer).pipe(uploadStream);
  });

// POST /api/notes
// Admin and Teacher
export const uploadNote = async (req, res) => {
  let uploadedFile;

  try {
    const { title, description, subject } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof subject !== "string" ||
      !subject.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Title and subject are required.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a PDF file.",
      });
    }

    if (req.file.buffer.subarray(0, 5).toString() !== "%PDF-") {
      return res.status(400).json({
        success: false,
        message: "The uploaded file is not a valid PDF.",
      });
    }

    uploadedFile = await uploadPdfToCloudinary(req.file);

    const note = await Note.create({
      title: title.trim(),
      description:
        typeof description === "string" ? description.trim() : "",
      subject: subject.trim(),
      fileUrl: uploadedFile.secure_url,
      cloudinaryPublicId: uploadedFile.public_id,
      uploadedBy: req.student._id,
      isPublished: false,
    });

    return res.status(201).json({
      success: true,
      message: "PDF uploaded successfully. Publish it when ready.",
      note,
    });
  } catch (error) {
    if (uploadedFile?.public_id) {
      try {
        await cloudinary.uploader.destroy(uploadedFile.public_id, {
          resource_type: "raw",
        });
      } catch (cleanupError) {
        console.error("Cloudinary cleanup failed:", cleanupError.message);
      }
    }

    console.error("Upload Note Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to upload the note.",
    });
  }
};

// GET /api/notes/admin
// Admin sees all notes; Teacher sees only their own notes
export const getAllNotesForAdmin = async (req, res) => {
  try {
    const filter = isAdmin(req.student)
      ? {}
      : { uploadedBy: req.student._id };

    const notes = await Note.find(filter)
      .populate("uploadedBy", "name email role")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: notes.length,
      notes,
    });
  } catch (error) {
    console.error("Get Notes Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notes.",
    });
  }
};

// GET /api/notes
// Authenticated users; published notes only
export const getPublishedNotes = async (req, res) => {
  try {
    const notes = await Note.find({ isPublished: true })
      .select("-cloudinaryPublicId")
      .populate("uploadedBy", "name")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: notes.length,
      notes,
    });
  } catch (error) {
    console.error("Get Published Notes Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch published notes.",
    });
  }
};

// PATCH /api/notes/:id/publish
// Admin can manage all notes; Teacher can manage their own
export const toggleNotePublish = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID.",
      });
    }

    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    if (!canManageNote(req.student, note)) {
      return res.status(403).json({
        success: false,
        message: "You can only manage notes you uploaded.",
      });
    }

    note.isPublished = !note.isPublished;
    await note.save();

    return res.status(200).json({
      success: true,
      message: note.isPublished
        ? "Note published successfully."
        : "Note unpublished successfully.",
      note,
    });
  } catch (error) {
    console.error("Toggle Note Publish Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update note status.",
    });
  }
};

// DELETE /api/notes/:id
// Admin can delete any note; Teacher can delete their own
export const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID.",
      });
    }

    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    if (!canManageNote(req.student, note)) {
      return res.status(403).json({
        success: false,
        message: "You can only delete notes you uploaded.",
      });
    }

    const result = await cloudinary.uploader.destroy(
      note.cloudinaryPublicId,
      { resource_type: "raw" }
    );

    if (result.result !== "ok" && result.result !== "not found") {
      return res.status(502).json({
        success: false,
        message: "Could not remove the PDF from storage.",
      });
    }

    await note.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Note deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Note Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete the note.",
    });
  }
};
