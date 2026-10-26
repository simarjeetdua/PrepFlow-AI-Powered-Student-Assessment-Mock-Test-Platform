
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Student from "../models/Student.js";

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const name = process.env.ADMIN_NAME;
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!name || !email || !password) {
      throw new Error(
        "Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD in your backend .env file."
      );
    }

    if (password.length < 12) {
      throw new Error("Admin password must be at least 12 characters.");
    }

    const existingUser = await Student.findOne({ email });

    if (existingUser) {
      if (existingUser.role === "admin") {
        console.log("This account is already an admin.");
      } else {
        console.log(
          "An account with this email already exists. No role changes were made."
        );
      }

      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await Student.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin account created successfully.");
  } catch (error) {
    console.error("Admin creation failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();
