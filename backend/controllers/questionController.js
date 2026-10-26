import Question from "../models/Question.js";
import MockTest from "../models/MockTest.js";

// Create a question
export const createQuestion = async (req, res) => {
    try {
        const {
            mockTest,
            questionText,
            options,
            correctAnswer,
            marks,
        } = req.body;

        if (
            !mockTest ||
            !questionText ||
            !options ||
            !correctAnswer
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Mock test, question, options and correct answer are required",
            });
        }

        if (!Array.isArray(options) || options.length < 2) {
            return res.status(400).json({
                success: false,
                message: "At least 2 options are required",
            });
        }

        if (!options.includes(correctAnswer)) {
            return res.status(400).json({
                success: false,
                message:
                    "Correct answer must match one of the options",
            });
        }

        // Check whether mock test exists
        const existingTest = await MockTest.findById(mockTest);

        if (!existingTest) {
            return res.status(404).json({
                success: false,
                message: "Mock test not found",
            });
        }

        const question = await Question.create({
            mockTest,
            questionText,
            options,
            correctAnswer,
            marks: marks || 1,
        });

        return res.status(201).json({
            success: true,
            message: "Question created successfully",
            question,
        });
    } catch (error) {
        console.error("Create Question Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// Get all questions for a mock test
export const getQuestionsByTest = async (req, res) => {
    try {
        const { testId } = req.params;

        const mockTest = await MockTest.findById(testId);

        if (!mockTest) {
            return res.status(404).json({
                success: false,
                message: "Mock test not found",
            });
        }

        const questions = await Question.find({
            mockTest: testId,
        }).sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            count: questions.length,
            questions,
        });
    } catch (error) {
        console.error("Get Questions Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// Get single question
export const getQuestionById = async (req, res) => {
    try {
        const question = await Question.findById(
            req.params.id
        );

        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found",
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
            message: error.message,
        });
    }
};


// Update question
export const updateQuestion = async (req, res) => {
    try {
        const {
            questionText,
            options,
            correctAnswer,
            marks,
        } = req.body;

        if (
            !questionText ||
            !options ||
            !correctAnswer
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Question, options and correct answer are required",
            });
        }

        if (!Array.isArray(options) || options.length < 2) {
            return res.status(400).json({
                success: false,
                message: "At least 2 options are required",
            });
        }

        if (!options.includes(correctAnswer)) {
            return res.status(400).json({
                success: false,
                message:
                    "Correct answer must match one of the options",
            });
        }

        const question =
            await Question.findByIdAndUpdate(
                req.params.id,
                {
                    questionText,
                    options,
                    correctAnswer,
                    marks: marks || 1,
                },
                {
                    new: true,
                    runValidators: true,
                }
            );

        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Question updated successfully",
            question,
        });
    } catch (error) {
        console.error("Update Question Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// Delete question
export const deleteQuestion = async (req, res) => {
    try {
        const question =
            await Question.findByIdAndDelete(
                req.params.id
            );

        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Question deleted successfully",
        });
    } catch (error) {
        console.error("Delete Question Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};