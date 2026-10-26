
import Student from "../models/Student.js";
import MockTest from "../models/MockTest.js";
import Note from "../models/Note.js";

export const getDashboardStats = async (req, res) => {
  try {
    const [students, teachers, tests, materials] =
      await Promise.all([
        Student.countDocuments({ role: "student" }),
        Student.countDocuments({ role: "teacher" }),
        MockTest.countDocuments(),
        Note.countDocuments(),
      ]);

    return res.status(200).json({
      success: true,
      stats: {
        students,
        teachers,
        tests,
        materials,
      },
    });
  } catch (error) {
    console.error(
      "Admin Dashboard Stats Error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard statistics.",
    });
  }
};
