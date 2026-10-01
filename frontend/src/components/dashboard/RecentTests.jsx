import {
    Clock,
    CheckCircle,
    ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const RecentTests = ({ tests = [] }) => {
    const navigate = useNavigate();

    return (
        <div className="recent-tests">

            {/* Header */}
            <div className="recent-tests-header">
                <div>
                    <h2>Recent Tests</h2>

                    <p>
                        Your recently attempted mock tests
                    </p>
                </div>

                <button
                    type="button"
                    className="view-all-button"
                    onClick={() => navigate("/mock-tests")}
                >
                    View All
                    <ArrowRight size={16} />
                </button>
            </div>

            {/* Empty State */}
            {tests.length === 0 ? (
                <div className="empty-tests">

                    <Clock size={32} />

                    <h3>
                        No tests attempted yet
                    </h3>

                    <p>
                        Start a mock test to see your
                        recent activity here.
                    </p>

                </div>
            ) : (

                /* Test List */
                <div className="test-list">

                    {tests.map((test) => (
                        <div
                            className="recent-test-item"
                            key={test.id || test._id}
                        >

                            {/* Test Information */}
                            <div className="test-info">

                                <div className="test-icon">
                                    <Clock size={18} />
                                </div>

                                <div>
                                    <h3>
                                        {test.title ||
                                            "Mock Test"}
                                    </h3>

                                    <p>
                                        {test.date ||
                                            "Recently attempted"}
                                    </p>
                                </div>

                            </div>

                            {/* Test Result */}
                            <div className="test-result">

                                <span className="test-status passed">
                                    <CheckCircle size={15} />
                                    Completed
                                </span>

                                <span className="test-score">
                                    {test.score !== undefined
                                        ? `${test.score}%`
                                        : "--"}
                                </span>

                            </div>

                        </div>
                    ))}

                </div>
            )}

        </div>
    );
};

export default RecentTests;