import { HelpCircle } from "lucide-react";
import OptionButton from "./OptionButton";

const QuestionCard = ({
    question,
    questionNumber,
    selectedAnswer,
    onAnswerSelect,
    showResult = false,
}) => {
    if (!question) {
        return null;
    }

    const {
        questionText,
        question: questionTitle,
        options = [],
        correctAnswer,
    } = question;

    const questionContent = questionText || questionTitle || "Question";

    return (
        <div className="question-card">

            {/* Question Header */}
            <div className="question-header">
                <div className="question-number">
                    Question {questionNumber}
                </div>

                <div className="question-icon">
                    <HelpCircle size={20} />
                </div>
            </div>

            {/* Question */}
            <div className="question-content">
                <h2>
                    {questionContent}
                </h2>
            </div>

            {/* Options */}
            <div className="question-options">
                {options.map((option, index) => {

                    const optionValue =
                        typeof option === "string"
                            ? option
                            : option.text || option.value || option.label;

                    const isSelected =
                        selectedAnswer === optionValue;

                    const isCorrect =
                        showResult &&
                        correctAnswer === optionValue;

                    const isIncorrect =
                        showResult &&
                        isSelected &&
                        correctAnswer !== optionValue;

                    return (
                        <OptionButton
                            key={index}
                            option={optionValue}
                            selected={isSelected}
                            correct={isCorrect}
                            incorrect={isIncorrect}
                            disabled={showResult}
                            onClick={() =>
                                onAnswerSelect(optionValue)
                            }
                        />
                    );
                })}
            </div>

        </div>
    );
};

export default QuestionCard;