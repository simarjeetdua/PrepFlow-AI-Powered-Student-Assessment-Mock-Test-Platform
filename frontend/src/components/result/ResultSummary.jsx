import {
    CheckCircle,
    XCircle,
    Clock,
    FileQuestion,
} from "lucide-react";

const ResultSummary = ({
    score = 0,
    totalQuestions = 0,
    correctAnswers = 0,
    incorrectAnswers = 0,
    unanswered = 0,
    duration = 0,
}) => {
    const percentage =
        totalQuestions > 0
            ? Math.round((correctAnswers / totalQuestions) * 100)
            : score;

    return (
        <div className="result-summary">

            {/* Header */}
            <div className="result-summary-header">
                <div className="result-summary-icon">
                    <CheckCircle size={32} />
                </div>

                <div>
                    <h2>Test Completed</h2>
                    <p>Here is your test performance summary.</p>
                </div>
            </div>

            {/* Score */}
            <div className="result-score-section">
                <span className="result-score-label">
                    Your Score
                </span>

                <div className="result-score">
                    {percentage}%
                </div>

                <span className="result-score-detail">
                    {correctAnswers} out of {totalQuestions} correct
                </span>
            </div>

            {/* Statistics */}
            <div className="result-statistics">

                {/* Correct */}
                <div className="result-stat correct">
                    <div className="result-stat-icon">
                        <CheckCircle size={20} />
                    </div>

                    <div>
                        <span className="result-stat-value">
                            {correctAnswers}
                        </span>

                        <span className="result-stat-label">
                            Correct
                        </span>
                    </div>
                </div>

                {/* Incorrect */}
                <div className="result-stat incorrect">
                    <div className="result-stat-icon">
                        <XCircle size={20} />
                    </div>

                    <div>
                        <span className="result-stat-value">
                            {incorrectAnswers}
                        </span>

                        <span className="result-stat-label">
                            Incorrect
                        </span>
                    </div>
                </div>

                {/* Unanswered */}
                <div className="result-stat unanswered">
                    <div className="result-stat-icon">
                        <FileQuestion size={20} />
                    </div>

                    <div>
                        <span className="result-stat-value">
                            {unanswered}
                        </span>

                        <span className="result-stat-label">
                            Unanswered
                        </span>
                    </div>
                </div>

                {/* Duration */}
                <div className="result-stat duration">
                    <div className="result-stat-icon">
                        <Clock size={20} />
                    </div>

                    <div>
                        <span className="result-stat-value">
                            {duration}
                        </span>

                        <span className="result-stat-label">
                            Minutes
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ResultSummary;