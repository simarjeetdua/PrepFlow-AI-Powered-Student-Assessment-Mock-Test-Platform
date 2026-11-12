import {
    Clock,
    FileQuestion,
    ArrowRight,
    ClipboardList,
    CheckCircle2,
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
    const diffLower = (difficulty || "easy").toLowerCase();
    const isPublished = String(status || "").toLowerCase() === "published";

    const handleStartTest = () => {
        if (!testId) {
            console.error("Mock test ID is missing.");
            return;
        }

        navigate(`/mock-tests/${testId}`);
    };

    return (
        <div className="mock-test-card">
            {/* Card Header with Badges separated without overlapping */}
            <div className="mock-test-card-top-row">
                <div className="mock-test-badges-group">
                    {/* Difficulty Badge: Emerald for Easy, Amber for Medium, Rose for Hard */}
                    <span className={`difficulty-badge ${diffLower}`}>
                        {difficulty}
                    </span>

                    {/* Separate subtle Published / Status badge */}
                    <span className={`status-badge-subtle ${isPublished ? "published" : "draft"}`}>
                        <span className={`status-badge-dot ${isPublished ? "published" : "draft"}`} />
                        {isPublished ? "Published" : (status || "Draft")}
                    </span>
                </div>

                <div className="mock-test-card-icon-pill" aria-hidden="true">
                    <ClipboardList size={16} strokeWidth={2.2} />
                </div>
            </div>

            {/* Test Content */}
            <div className="mock-test-card-body">
                <h3 className="mock-test-card-title" title={title}>
                    {title}
                </h3>

                <p className="mock-test-card-desc">
                    {description || "Comprehensive mock assessment designed to evaluate and sharpen core exam competencies."}
                </p>

                {/* Consistent Metadata Row */}
                <div className="mock-test-meta-row">
                    <div className="mock-test-meta-pill" title="Test Duration">
                        <Clock size={15} className="meta-icon" strokeWidth={2} />
                        <span>{duration} mins</span>
                    </div>

                    <div className="mock-test-meta-divider" aria-hidden="true" />

                    <div className="mock-test-meta-pill" title="Total Questions">
                        <FileQuestion size={15} className="meta-icon" strokeWidth={2} />
                        <span>{totalQuestions} questions</span>
                    </div>

                    <div className="mock-test-meta-divider" aria-hidden="true" />

                    <div className="mock-test-meta-pill scoring-highlight" title="Scoring Breakdown">
                        <CheckCircle2 size={15} className="meta-icon" strokeWidth={2} />
                        <span>Instant Score</span>
                    </div>
                </div>
            </div>

            {/* Card Footer with Start Assessment Button */}
            <div className="mock-test-card-actions">
                <button
                    type="button"
                    className="start-assessment-btn"
                    onClick={handleStartTest}
                    disabled={!isPublished}
                    title={isPublished ? `Start ${title}` : "This test is not currently available"}
                >
                    <span>{isPublished ? "Start Assessment" : "Currently Unavailable"}</span>
                    {isPublished && <ArrowRight size={16} className="btn-arrow" strokeWidth={2.2} />}
                </button>
            </div>
        </div>
    );
};

export default MockTestCard;
