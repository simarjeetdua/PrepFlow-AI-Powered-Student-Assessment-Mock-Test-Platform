import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
    {
        mockTest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "MockTest",
            required: [true, "Mock test is required"],
        },

        questionText: {
            type: String,
            required: [true, "Question text is required"],
            trim: true,
        },

        options: {
            type: [String],
            required: [true, "Options are required"],
            validate: {
                validator: function (options) {
                    return options.length >= 2;
                },
                message: "A question must have at least 2 options",
            },
        },

        correctAnswer: {
            type: String,
            required: [true, "Correct answer is required"],
            trim: true,
        },

        marks: {
            type: Number,
            default: 1,
            min: 1,
        },
    },
    {
        timestamps: true,
    }
);

const Question =
    mongoose.models.Question ||
    mongoose.model("Question", questionSchema);

export default Question;