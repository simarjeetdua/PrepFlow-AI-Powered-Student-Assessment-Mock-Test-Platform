import {
    Trophy,
    TrendingUp,
    Target,
    RotateCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ScoreCard = ({
    score = 0,
    totalQuestions = 0,
    correctAnswers = 0,
    testId,
}) => {
    const navigate = useNavigate();

    const percentage =
        totalQuestions > 0
            ? Math.round((correctAnswers / totalQuestions) * 100)
            : score;

    const handleRetake = () => {
        if (!testId) {
            return;
        }

        navigate(`/mock-tests/${testId}`);
    };

    return (
        <div className="score-card">

            {/* Trophy */}
            <div className="score-card-trophy">
                <Trophy size={30} />
            </div>

            {/* Score */}
            <div className="score-card-content">
                <span className="score-card-label">
                    Overall Score
                </span>

                <h1 className="score-card-score">
                    {percentage}%
                </h1>

                <p className="score-card-description">
                    You answered{" "}
                    <strong>{correctAnswers}</strong>{" "}
                    out of{" "}
                    <strong>{totalQuestions}</strong>{" "}
                    questions correctly.
                </p>
            </div>

            {/* Score Details */}
            <div className="score-card-stats">

                <div className="score-card-stat">
                    <Target size={19} />

                    <div>
                        <span>
                            {correctAnswers}
                        </span>

                        <small>
                            Correct Answers
                        </small>
                    </div>
                </div>

                <div className="score-card-stat">
                    <TrendingUp size={19} />

                    <div>
                        <span>
                            {percentage}%
                        </span>

                        <small>
                            Accuracy
                        </small>
                    </div>
                </div>

            </div>

            {/* Retake */}
            {testId && (
                <button
                    type="button"
                    className="retake-test-button"
                    onClick={handleRetake}
                >
                    <RotateCcw size={17} />
                    Retake Test
                </button>
            )}

        </div>
    );
};

export default ScoreCard;