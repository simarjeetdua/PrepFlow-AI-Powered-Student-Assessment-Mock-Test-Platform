import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    ArrowRight,
    Clock,
    FileQuestion,
    BarChart3,
    CheckCircle,
    AlertCircle,
} from "lucide-react";
import api from "../../services/api";

const MockTestDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [test, setTest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchMockTest = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get(`/mocktests/${id}`);

                setTest(response.data.mockTest);
            } catch (error) {
                console.error("Failed to fetch mock test:", error);

                setError(
                    error.response?.data?.message ||
                    "Unable to load mock test."
                );
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchMockTest();
        }
    }, [id]);

    const handleStartTest = () => {
        if (!test?._id) {
            return;
        }

        navigate(`/mock-tests/${test._id}/take`);
    };

    if (loading) {
        return (
            <div className="mock-test-details-page">
                <div className="page-loading">
                    Loading mock test...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mock-test-details-page">
                <div className="page-error">
                    <AlertCircle size={24} />

                    <h2>Unable to load test</h2>

                    <p>{error}</p>

                    <button
                        type="button"
                        onClick={() => navigate("/mock-tests")}
                    >
                        Back to Mock Tests
                    </button>
                </div>
            </div>
        );
    }

    if (!test) {
        return (
            <div className="mock-test-details-page">
                <div className="page-error">
                    <AlertCircle size={24} />

                    <h2>Mock test not found</h2>

                    <button
                        type="button"
                        onClick={() => navigate("/mock-tests")}
                    >
                        Back to Mock Tests
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="mock-test-details-page">

            {/* Back Button */}
            <button
                type="button"
                className="back-button"
                onClick={() => navigate("/mock-tests")}
            >
                <ArrowLeft size={18} />
                Back to Mock Tests
            </button>

            {/* Test Header */}
            <div className="mock-test-details-header">

                <div className="details-header-content">
                    <div className="mock-test-details-icon">
                        <BarChart3 size={28} />
                    </div>

                    <div>
                        <span
                            className={`difficulty-badge ${test.difficulty?.toLowerCase()}`}
                        >
                            {test.difficulty}
                        </span>

                        <h1>{test.title}</h1>

                        <p>
                            {test.description}
                        </p>
                    </div>
                </div>

            </div>

            {/* Test Information */}
            <div className="test-information">

                <div className="information-card">
                    <Clock size={22} />

                    <div>
                        <span>Duration</span>
                        <strong>{test.duration} minutes</strong>
                    </div>
                </div>

                <div className="information-card">
                    <FileQuestion size={22} />

                    <div>
                        <span>Questions</span>
                        <strong>
                            {test.totalQuestions}
                        </strong>
                    </div>
                </div>

                <div className="information-card">
                    <BarChart3 size={22} />

                    <div>
                        <span>Difficulty</span>
                        <strong>
                            {test.difficulty}
                        </strong>
                    </div>
                </div>

            </div>

            {/* Instructions */}
            <div className="test-instructions">

                <div className="section-heading">
                    <CheckCircle size={20} />

                    <h2>Before You Start</h2>
                </div>

                <ul>
                    <li>
                        Make sure you have a stable internet connection.
                    </li>

                    <li>
                        The timer will start once you begin the test.
                    </li>

                    <li>
                        Each question should be answered carefully.
                    </li>

                    <li>
                        Make sure to submit the test before the timer ends.
                    </li>

                    <li>
                        Once submitted, you will be able to view your result.
                    </li>
                </ul>

            </div>

            {/* Start Test */}
            <div className="start-test-section">

                <div>
                    <h3>
                        Ready to begin?
                    </h3>

                    <p>
                        You have {test.duration} minutes to complete{" "}
                        {test.totalQuestions} questions.
                    </p>
                </div>

                <button
                    type="button"
                    className="start-test-button"
                    onClick={handleStartTest}
                    disabled={test.status !== "Published"}
                >
                    {test.status === "Published"
                        ? "Start Test"
                        : "Test Not Available"}

                    {test.status === "Published" && (
                        <ArrowRight size={18} />
                    )}
                </button>

            </div>

        </div>
    );
};

export default MockTestDetails;