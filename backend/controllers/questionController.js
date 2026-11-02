
import mongoose from "mongoose";
import Question from "../models/Question.js";
import MockTest from "../models/MockTest.js";

// Check whether user is admin
const isAdmin = (user) => user.role === "admin";

// Check whether user can manage a particular mock test
const canManageTest = (user, test) =>
  isAdmin(user) ||
  test.createdBy?.toString() === user._id.toString();

// Validate MongoDB ObjectId
const isValidId = (id) =>
  mongoose.isValidObjectId(id);

// Validate question data
const validateQuestionData = ({
  questionText,
  options,
  correctAnswer,
  marks,
}) => {
  if (
    typeof questionText !== "string" ||
    !questionText.trim()
  ) {
    return "Question text is required.";
  }

  if (!Array.isArray(options) || options.length < 2) {
    return "At least 2 options are required.";
  }

  if (
    options.some(
      (option) =>
        typeof option !== "string" || !option.trim()
    )
  ) {
    return "All options must be non-empty strings.";
  }

  if (new Set(options.map((option) => option.trim())).size !== options.length) {
    return "Duplicate options are not allowed.";
  }

  if (
    typeof correctAnswer !== "string" ||
    !options.some(
      (option) => option.trim() === correctAnswer.trim()
    )
  ) {
    return "Correct answer must match one of the options.";
  }

  if (
    marks !== undefined &&
    (!Number.isFinite(Number(marks)) || Number(marks) < 1)
  ) {
    return "Marks must be a number greater than or equal to 1.";
  }

  return null;
};


// =====================================================
// CREATE QUESTION
// POST /api/questions
// Admin and Teacher
// =====================================================

export const createQuestion = async (req, res) => {
  try {
    const {
      mockTest,
      questionText,
      options,
      correctAnswer,
      marks,
    } = req.body;

    if (!mockTest) {
      return res.status(400).json({
        success: false,
        message: "Mock test is required.",
      });
    }

    if (!isValidId(mockTest)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mock test ID.",
      });
    }

    const validationError = validateQuestionData({
      questionText,
      options,
      correctAnswer,
      marks,
    });

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const existingTest = await MockTest.findById(mockTest);

    if (!existingTest) {
      return res.status(404).json({
        success: false,
        message: "Mock test not found.",
      });
    }

    if (!canManageTest(req.student, existingTest)) {
      return res.status(403).json({
        success: false,
        message: "You cannot add questions to this mock test.",
      });
    }

    const question = await Question.create({
      mockTest,
      questionText: questionText.trim(),
      options: options.map((option) => option.trim()),
      correctAnswer: correctAnswer.trim(),
      marks: marks === undefined ? 1 : Number(marks),
    });

    return res.status(201).json({
      success: true,
      message: "Question created successfully.",
      question,
    });

  } catch (error) {
    console.error("Create Question Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create question.",
    });
  }
};


// =====================================================
// GET QUESTIONS FOR ADMIN
// GET /api/questions/admin/test/:testId
// Admin and Teacher
// Includes correct answers
// =====================================================

export const getAdminQuestionsByTest = async (req, res) => {
  try {
    const { testId } = req.params;

    if (!isValidId(testId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mock test ID.",
      });
    }

    const mockTest = await MockTest.findById(testId);

    if (!mockTest) {
      return res.status(404).json({
        success: false,
        message: "Mock test not found.",
      });
    }

    if (!canManageTest(req.student, mockTest)) {
      return res.status(403).json({
        success: false,
        message: "You cannot view questions for this mock test.",
      });
    }

    const questions = await Question.find({
      mockTest: testId,
    })
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: questions.length,
      questions,
    });

  } catch (error) {
    console.error("Get Admin Questions Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch questions.",
    });
  }
};


// =====================================================
// GET QUESTIONS FOR STUDENT
// GET /api/questions/test/:testId
// Correct answers are hidden
// =====================================================

export const getQuestionsByTest = async (req, res) => {
  try {
    const { testId } = req.params;

    if (!isValidId(testId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mock test ID.",
      });
    }

    const mockTest = await MockTest.findById(testId);

    if (!mockTest) {
      return res.status(404).json({
        success: false,
        message: "Mock test not found.",
      });
    }

    // Students can access published mock tests only.
    // Admin and teachers can preview their own tests.
    const isStudent = req.student.role === "student";

    if (isStudent && mockTest.status !== "Published") {
      return res.status(403).json({
        success: false,
        message: "This mock test is not available.",
      });
    }

    if (
      !isStudent &&
      !canManageTest(req.student, mockTest)
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot access this mock test.",
      });
    }

    const questions = await Question.find({
      mockTest: testId,
    })
      .select("-correctAnswer")
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: questions.length,
      questions,
    });

  } catch (error) {
    console.error("Get Questions Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch questions.",
    });
  }
};


// =====================================================
// GET SINGLE QUESTION
// GET /api/questions/:id
// Admin and Teacher
// =====================================================

export const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID.",
      });
    }

    const question = await Question.findById(id)
      .populate("mockTest", "title createdBy status");

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found.",
      });
    }

    if (!canManageTest(req.student, question.mockTest)) {
      return res.status(403).json({
        success: false,
        message: "You cannot access this question.",
      });
    }

    return res.status(200).json({
      success: true,
      question,
    });

  } catch (error) {
    console.error("Get Question Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch question.",
    });
  }
};


// =====================================================
// UPDATE QUESTION
// PUT /api/questions/:id
// Admin and Teacher
// =====================================================

export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID.",
      });
    }

    const {
      questionText,
      options,
      correctAnswer,
      marks,
    } = req.body;

    const validationError = validateQuestionData({
      questionText,
      options,
      correctAnswer,
      marks,
    });

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found.",
      });
    }

    const mockTest = await MockTest.findById(question.mockTest);

    if (!mockTest) {
      return res.status(404).json({
        success: false,
        message: "Associated mock test not found.",
      });
    }

    if (!canManageTest(req.student, mockTest)) {
      return res.status(403).json({
        success: false,
        message: "You cannot edit this question.",
      });
    }

    question.questionText = questionText.trim();

    question.options = options.map(
      (option) => option.trim()
    );

    question.correctAnswer = correctAnswer.trim();

    question.marks =
      marks === undefined ? 1 : Number(marks);

    await question.save();

    return res.status(200).json({
      success: true,
      message: "Question updated successfully.",
      question,
    });

  } catch (error) {
    console.error("Update Question Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update question.",
    });
  }
};


// =====================================================
// DELETE QUESTION
// DELETE /api/questions/:id
// Admin and Teacher
// =====================================================

export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID.",
      });
    }

    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found.",
      });
    }

    const mockTest = await MockTest.findById(
      question.mockTest
    );

    if (!mockTest) {
      return res.status(404).json({
        success: false,
        message: "Associated mock test not found.",
      });
    }

    if (!canManageTest(req.student, mockTest)) {
      return res.status(403).json({
        success: false,
        message: "You cannot delete this question.",
      });
    }

    await question.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Question deleted successfully.",
    });

  } catch (error) {
    console.error("Delete Question Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete question.",
    });
  }
};
