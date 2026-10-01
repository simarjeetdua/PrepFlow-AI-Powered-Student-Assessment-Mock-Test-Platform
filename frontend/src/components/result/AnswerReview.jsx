import { CheckCircle, XCircle, MinusCircle } from "lucide-react";

const AnswerReview = ({ answers = [] }) => {
    if (answers.length === 0) {
        return (
            <div className="answer-review empty">
                <p>No answer details available.</p>
            </div>
        );
    }

    return (
        <div className="answer-review">
            <div className="answer-review-header">
                <div>
                    <h2>Answer Review</h2>
                    <p>Review your answers and see the correct answers.</p>
                </div>
            </div>

            <div className="answer-review-list">
                {answers.map((answer, index) => {
                    const {
                        question,
                        selectedAnswer,
                        correctAnswer,
                        isCorrect,
                    } = answer;

                    const unanswered =
                        !selectedAnswer ||
                        selectedAnswer.trim() === "";

                    const status = unanswered
                        ? "unanswered"
                        : isCorrect
                        ? "correct"
                        : "incorrect";

                    return (
                        <div
                            className={`answer-review-item ${status}`}
                            key={answer.id || answer._id || index}
                        >
                            {/* Question */}
                            <div className="review-question">
                                <span className="review-question-number">
                                    Question {index + 1}
                                </span>

                                <h3>{question}</h3>
                            </div>

                            {/* Student Answer */}
                            <div className="review-answer">
                                <span className="review-label">
                                    Your Answer
                                </span>

                                <div className="review-answer-value">
                                    {unanswered ? (
                                        <>
                                            <MinusCircle size={18} />
                                            <span>Not Answered</span>
                                        </>
                                    ) : (
                                        <>
                                            {isCorrect ? (
                                                <CheckCircle size={18} />
                                            ) : (
                                                <XCircle size={18} />
                                            )}

                                            <span>
                                                {selectedAnswer}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Correct Answer */}
                            {(!isCorrect || unanswered) && (
                                <div className="review-correct-answer">
                                    <span className="review-label">
                                        Correct Answer
                                    </span>

                                    <div className="correct-answer-value">
                                        <CheckCircle size={18} />
                                        <span>{correctAnswer}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AnswerReview;