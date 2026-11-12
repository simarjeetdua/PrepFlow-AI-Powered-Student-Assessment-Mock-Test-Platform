import {
    Clock,
    CheckCircle2,
    ArrowRight,
    ClipboardList,
    Calendar,
    ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const RecentTests = ({ tests = [] }) => {
    const navigate = useNavigate();

    return (
        <div className="recent-tests">
            {/* Header */}
            <div className="recent-tests-header">
                <div>
                    <h2>Recent Test Activity</h2>
                    <p>Review your most recently completed mock assessments</p>
                </div>

                <button
                    type="button"
                    className="view-all-button"
                    onClick={() => navigate("/mock-tests")}
                >
                    <span>View All Tests</span>
                    <ArrowRight size={15} />
                </button>
            </div>

            {/* Empty State */}
            {tests.length === 0 ? (
                <div className="empty-tests">
                    <div className="empty-tests-icon-wrap">
                        <ClipboardList size={28} />
                    </div>
                    <h3>No tests completed yet</h3>
                    <p>
                        Take your first practice assessment to track your scores, timing, and topic mastery.
                    </p>
                    <button
                        type="button"
                        className="empty-action-btn"
                        onClick={() => navigate("/mock-tests")}
                    >
                        <span>Browse Available Tests</span>
                        <ChevronRight size={16} />
                    </button>
                </div>
            ) : (
                /* Test List */
                <div className="test-list">
                    {tests.map((test) => {
                        const score = test.score !== undefined ? Number(test.score) : null;
                        const scoreTone =
                            score !== null
                                ? score >= 75
                                    ? "score-high"
                                    : score >= 50
                                    ? "score-medium"
                                    : "score-low"
                                : "";

                        return (
                            <div
                                className="recent-test-item"
                                key={test.id || test._id}
                                onClick={() => test.id && navigate(`/mock-tests/${test.id}`)}
                                role="button"
                                tabIndex={0}
                            >
                                {/* Test Info */}
                                <div className="test-info">
                                    <div className="test-icon">
                                        <ClipboardList size={18} strokeWidth={2} />
                                    </div>

                                    <div className="test-text-col">
                                        <h3>{test.title || "Untitled Assessment"}</h3>
                                        <div className="test-meta-row">
                                            <span className="test-meta-item">
                                                <Calendar size={13} />
                                                <span>{test.date || "Recently completed"}</span>
                                            </span>
                                            {test.totalQuestions > 0 && (
                                                <span className="test-meta-dot">•</span>
                                            )}
                                            {test.totalQuestions > 0 && (
                                                <span className="test-meta-item">
                                                    {test.totalQuestions} questions
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Test Result */}
                                <div className="test-result">
                                    <span className="test-status completed">
                                        <CheckCircle2 size={14} />
                                        <span>Completed</span>
                                    </span>

                                    <span className={`test-score-badge ${scoreTone}`}>
                                        {score !== null ? `${score}%` : "—"}
                                    </span>

                                    <ChevronRight size={16} className="test-item-chevron" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default RecentTests;
