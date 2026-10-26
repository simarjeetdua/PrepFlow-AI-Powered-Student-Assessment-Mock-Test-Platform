import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
    {
        question: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question",
            required: true,
        },

        selectedAnswer: {
            type: String,
            default: "",
        },

        correctAnswer: {
            type: String,
            required: true,
        },

        isCorrect: {
            type: Boolean,
            default: false,
        },

        marks: {
            type: Number,
            default: 1,
        },
    },
    {
        _id: false,
    }
);

const testResultSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
        },

        mockTest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "MockTest",
            required: true,
        },

        answers: {
            type: [answerSchema],
            default: [],
        },

        totalQuestions: {
            type: Number,
            required: true,
            min: 0,
        },

        correctAnswers: {
            type: Number,
            default: 0,
            min: 0,
        },

        incorrectAnswers: {
            type: Number,
            default: 0,
            min: 0,
        },

        unanswered: {
            type: Number,
            default: 0,
            min: 0,
        },

        score: {
            type: Number,
            default: 0,
            min: 0,
        },

        percentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },

        timeTaken: {
            type: Number,
            default: 0,
            min: 0,
        },

        submittedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

const TestResult =
    mongoose.models.TestResult ||
    mongoose.model("TestResult", testResultSchema);

export default TestResult;