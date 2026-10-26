
import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
    },

    role: {
      type: String,
      enum: ["admin", "teacher", "student"],
      default: "student",
    },
  },
  {
    timestamps: true,
  }
);

const Student =
  mongoose.models.Student ||
  mongoose.model("Student", studentSchema);

export default Student;
