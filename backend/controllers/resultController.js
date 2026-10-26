import TestResult from "../models/TestResult.js";
import Question from "../models/Question.js";
import MockTest from "../models/MockTest.js";

// Submit test and calculate result
export const submitTest = async (req, res) => {
    try {
        const { testId, answers = [], timeTaken = 0 } = req.body;

        if (!testId) {
            return res.status(400).json({
                success: false,
                message: "Mock test ID is required",
            });
        }

        // Check if mock test exists
        const mockTest = await MockTest.findById(testId);

        if (!mockTest) {
            return res.status(404).json({
                success: false,
                message: "Mock test not found",
            });
        }

        // Get questions from database
        const questions = await Question.find({
            mockTest: testId,
        }).sort({ createdAt: 1 });

        if (questions.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No questions found for this test",
            });
        }

        // Create a quick lookup for submitted answers
        const submittedAnswers = new Map();

        answers.forEach((answer) => {
            if (answer.questionId) {
                submittedAnswers.set(
                    answer.questionId.toString(),
                    answer.selectedAnswer || ""
                );
            }
        });

        let correctAnswers = 0;
        let incorrectAnswers = 0;
        let unanswered = 0;
        let score = 0;

        const resultAnswers = questions.map((question) => {
            const questionId = question._id.toString();

            const selectedAnswer =
                submittedAnswers.get(questionId) || "";

            const isUnanswered =
                selectedAnswer.trim() === "";

            const isCorrect =
                !isUnanswered &&
                selectedAnswer === question.correctAnswer;

            if (isUnanswered) {
                unanswered++;
            } else if (isCorrect) {
                correctAnswers++;
                score += question.marks || 1;
            } else {
                incorrectAnswers++;
            }

            return {
                question: question._id,
                selectedAnswer,
                correctAnswer: question.correctAnswer,
                isCorrect,
                marks: question.marks || 1,
            };
        });

        const totalQuestions = questions.length;

        const totalMarks = questions.reduce(
            (total, question) =>
                total + (question.marks || 1),
            0
        );

        const percentage =
            totalMarks > 0
                ? Math.round((score / totalMarks) * 100)
                : 0;

        // Save result
        const result = await TestResult.create({
            student: req.student._id,
            mockTest: testId,
            answers: resultAnswers,
            totalQuestions,
            correctAnswers,
            incorrectAnswers,
            unanswered,
            score,
            percentage,
            timeTaken,
            submittedAt: new Date(),
        });

        return res.status(201).json({
            success: true,
            message: "Test submitted successfully",
            resultId: result._id,
            result,
        });
    } catch (error) {
        console.error("Submit Test Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// Get result by ID
export const getResultById = async (req, res) => {
    try {
        const result = await TestResult.findById(
            req.params.id
        )
            .populate(
                "mockTest",
                "title description duration totalQuestions difficulty"
            )
            .populate(
                "student",
                "name email"
            )
            .populate(
                "answers.question",
                "questionText options"
            );

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Result not found",
            });
        }

        // Make sure the student can only see their own result
        if (
            result.student._id.toString() !==
            req.student._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to view this result",
            });
        }

        return res.status(200).json({
            success: true,
            result,
        });
    } catch (error) {
        console.error("Get Result Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// Get all results of logged-in student
export const getMyResults = async (req, res) => {
    try {
        const results = await TestResult.find({
            student: req.student._id,
        })
            .populate(
                "mockTest",
                "title duration totalQuestions difficulty"
            )
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: results.length,
            results,
        });
    } catch (error) {
        console.error("Get My Results Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};