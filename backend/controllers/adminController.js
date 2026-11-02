
import mongoose from "mongoose";

import Student from "../models/Student.js";
import MockTest from "../models/MockTest.js";
import Note from "../models/Note.js";
import TestResult from "../models/TestResult.js";

// GET ADMIN DASHBOARD STATISTICS
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
    console.error("Admin Dashboard Stats Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard statistics.",
    });
  }
};

// GET ALL REGISTERED USERS
// GET /api/admin/users
export const getAllUsers = async (req, res) => {
  try {
    const users = await Student.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get All Users Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch registered users.",
    });
  }
};

// DELETE USER
// DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    // Find the user
    const user = await Student.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Prevent deleting admin accounts
    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin accounts cannot be deleted.",
      });
    }

    // Prevent deleting the currently logged-in admin
    if (user._id.toString() === req.student._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You cannot delete your own account.",
      });
    }

    await user.deleteOne();

    return res.status(200).json({
      success: true,
      message: `${user.name}'s account deleted successfully.`,
    });
  } catch (error) {
    console.error("Delete User Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete user account.",
    });
  }
};


// GET STUDENT PERFORMANCE
// GET /api/admin/performance
export const getStudentPerformance = async (req, res) => {
  try {
    // Fetch all registered students (without passwords).
    const students = await Student.find({
      role: "student",
    })
      .select("name email createdAt")
      .sort({ createdAt: -1 })
      .lean();

    // Aggregate test results student-wise.
    const performanceData = await TestResult.aggregate([
      {
        $group: {
          _id: "$student",

          totalAttempts: {
            $sum: 1,
          },

          averageScore: {
            $avg: "$percentage",
          },

          bestScore: {
            $max: "$percentage",
          },

          lastAttemptAt: {
            $max: {
              $ifNull: ["$submittedAt", "$createdAt"],
            },
          },
        },
      },
    ]);

    // Convert aggregated results into a lookup map.
    const performanceMap = new Map(
      performanceData.map((item) => [
        item._id.toString(),
        item,
      ])
    );

    // Merge student profiles with performance data.
    const result = students.map((student) => {
      const performance = performanceMap.get(
        student._id.toString()
      );

      return {
        _id: student._id,
        name: student.name,
        email: student.email,
        createdAt: student.createdAt,

        totalAttempts: performance?.totalAttempts || 0,

        averageScore: Number(
          (performance?.averageScore || 0).toFixed(1)
        ),

        bestScore: Number(
          (performance?.bestScore || 0).toFixed(1)
        ),

        lastAttemptAt:
          performance?.lastAttemptAt || null,
      };
    });

    return res.status(200).json({
      success: true,
      count: result.length,
      students: result,
    });

  } catch (error) {
    console.error(
      "Student Performance Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch student performance.",
    });
  }
};

