const TestProgress = ({
    currentQuestion,
    totalQuestions,
    answeredQuestions = 0,
}) => {
    if (!totalQuestions) {
        return null;
    }

    const progressPercentage =
        (answeredQuestions / totalQuestions) * 100;

    return (
        <div className="test-progress">

            {/* Progress Header */}
            <div className="test-progress-header">
                <span className="progress-title">
                    Test Progress
                </span>

                <span className="progress-count">
                    {answeredQuestions} / {totalQuestions} answered
                </span>
            </div>

            {/* Progress Bar */}
            <div className="test-progress-bar">
                <div
                    className="test-progress-fill"
                    style={{
                        width: `${Math.min(
                            Math.max(progressPercentage, 0),
                            100
                        )}%`,
                    }}
                />
            </div>

            {/* Current Question */}
            <div className="current-question-info">
                Question {currentQuestion + 1} of {totalQuestions}
            </div>

        </div>
    );
};

export default TestProgress;