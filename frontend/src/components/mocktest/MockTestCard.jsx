import {
    Clock,
    FileQuestion,
    ArrowRight,
    BarChart3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const MockTestCard = ({ test }) => {
    const navigate = useNavigate();

    if (!test) {
        return null;
    }

    const {
        _id,
        id,
        title = "Untitled Mock Test",
        description = "No description available.",
        duration = 0,
        totalQuestions = 0,
        difficulty = "Easy",
        status = "Published",
    } = test;

    const testId = _id || id;

    const difficultyClass = difficulty.toLowerCase();

    const handleStartTest = () => {
        if (!testId) {
            console.error("Mock test ID is missing.");
            return;
        }

        navigate(`/mock-tests/${testId}`);
    };

    return (
        <div className="mock-test-card">

            {/* Card Header */}
            <div className="mock-test-card-header">
                <div className="mock-test-icon">
                    <BarChart3 size={22} />
                </div>

                <span
                    className={`difficulty-badge ${difficultyClass}`}
                >
                    {difficulty}
                </span>
            </div>

            {/* Test Information */}
            <div className="mock-test-card-content">

                <h3 className="mock-test-title">
                    {title}
                </h3>

                <p className="mock-test-description">
                    {description}
                </p>

                {/* Test Details */}
                <div className="mock-test-details">

                    <div className="mock-test-detail">
                        <Clock size={17} />
                        <span>
                            {duration} min
                        </span>
                    </div>

                    <div className="mock-test-detail">
                        <FileQuestion size={17} />
                        <span>
                            {totalQuestions} Questions
                        </span>
                    </div>

                </div>

                {/* Status */}
                <div className="mock-test-status">
                    <span
                        className={`status-dot ${
                            status === "Published"
                                ? "published"
                                : "draft"
                        }`}
                    ></span>

                    {status}
                </div>

            </div>

            {/* Card Footer */}
            <div className="mock-test-card-footer">

                <button
                    type="button"
                    className="start-test-button"
                    onClick={handleStartTest}
                    disabled={status !== "Published"}
                >
                    {status === "Published"
                        ? "Start Test"
                        : "Not Available"}

                    {status === "Published" && (
                        <ArrowRight size={17} />
                    )}
                </button>

            </div>

        </div>
    );
};

export default MockTestCard;