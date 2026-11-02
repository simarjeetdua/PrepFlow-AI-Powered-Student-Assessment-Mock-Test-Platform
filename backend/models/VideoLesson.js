
import mongoose from "mongoose";

const videoLessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    videoUrl: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator(value) {
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
        },
        message: "Only secure YouTube and Vimeo URLs are allowed.",
      },
    },

    duration: {
      type: Number,
      min: 0,
      default: null,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const VideoLesson = mongoose.model(
  "VideoLesson",
  videoLessonSchema
);

export default VideoLesson;
