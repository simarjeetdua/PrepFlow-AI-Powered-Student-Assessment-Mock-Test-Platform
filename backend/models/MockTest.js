import mongoose from "mongoose";

const mockTestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },

    duration: {
      type: Number,
      required: true,
      min: 1,
    },

    totalQuestions: {
      type: Number,
      required: [true, "Total Questions are required"],
      min: 1,
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },

    status: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Draft",
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        
    },
  },
  {
    timestamps: true,
  }
);

const MockTest = mongoose.model("MockTest", mockTestSchema);

export default MockTest;