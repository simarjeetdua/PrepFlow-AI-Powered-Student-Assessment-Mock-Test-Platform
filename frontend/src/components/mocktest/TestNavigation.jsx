import { ChevronLeft, ChevronRight, Send } from "lucide-react";

const TestNavigation = ({
    currentQuestion,
    totalQuestions,
    onPrevious,
    onNext,
    onSubmit,
}) => {
    const isFirstQuestion = currentQuestion === 0;
    const isLastQuestion = currentQuestion === totalQuestions - 1;

    return (
        <div className="test-navigation">

            {/* Previous Button */}
            <button
                type="button"
                className="test-nav-button previous-button"
                onClick={onPrevious}
                disabled={isFirstQuestion}
            >
                <ChevronLeft size={18} />
                Previous
            </button>

            {/* Question Counter */}
            <div className="question-counter">
                <span>
                    {currentQuestion + 1}
                </span>

                <span className="counter-separator">
                    /
                </span>

                <span>
                    {totalQuestions}
                </span>
            </div>

            {/* Next / Submit Button */}
            {isLastQuestion ? (
                <button
                    type="button"
                    className="test-nav-button submit-test-button"
                    onClick={onSubmit}
                >
                    Submit Test
                    <Send size={17} />
                </button>
            ) : (
                <button
                    type="button"
                    className="test-nav-button next-button"
                    onClick={onNext}
                >
                    Next
                    <ChevronRight size={18} />
                </button>
            )}

        </div>
    );
};

export default TestNavigation;