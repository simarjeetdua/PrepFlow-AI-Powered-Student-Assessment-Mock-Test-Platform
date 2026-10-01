import { useEffect, useState } from "react";
import {
    ClipboardList,
    AlertCircle,
    RefreshCw,
} from "lucide-react";
import api from "../../services/api";
import MockTestCard from "../../components/mocktest/MockTestCard";

const MockTests = () => {
    const [mockTests, setMockTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchMockTests = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/mocktests");

            setMockTests(response.data.mockTests || []);
        } catch (error) {
            console.error("Failed to fetch mock tests:", error);

            setError(
                error.response?.data?.message ||
                "Unable to load mock tests. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMockTests();
    }, []);

    return (
        <div className="mock-tests-page">

            {/* Page Header */}
            <div className="mock-tests-page-header">

                <div className="page-header-content">
                    <div className="page-header-icon">
                        <ClipboardList size={24} />
                    </div>

                    <div>
                        <h1>Mock Tests</h1>

                        <p>
                            Test your knowledge and improve your
                            preparation.
                        </p>
                    </div>
                </div>

                {!loading && (
                    <span className="mock-test-count">
                        {mockTests.length}{" "}
                        {mockTests.length === 1
                            ? "Test"
                            : "Tests"}
                    </span>
                )}

            </div>

            {/* Loading */}
            {loading && (
                <div className="mock-tests-loading">
                    <div className="loading-spinner"></div>

                    <p>
                        Loading mock tests...
                    </p>
                </div>
            )}

            {/* Error */}
            {!loading && error && (
                <div className="mock-tests-error">

                    <AlertCircle size={24} />

                    <div>
                        <h3>
                            Something went wrong
                        </h3>

                        <p>
                            {error}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={fetchMockTests}
                        className="retry-button"
                    >
                        <RefreshCw size={17} />
                        Retry
                    </button>

                </div>
            )}

            {/* Empty State */}
            {!loading &&
                !error &&
                mockTests.length === 0 && (
                    <div className="mock-tests-empty">

                        <div className="empty-icon">
                            <ClipboardList size={32} />
                        </div>

                        <h2>
                            No Mock Tests Available
                        </h2>

                        <p>
                            There are currently no mock tests
                            available. Please check again later.
                        </p>

                    </div>
                )}

            {/* Mock Tests */}
            {!loading &&
                !error &&
                mockTests.length > 0 && (
                    <div className="mock-tests-grid">

                        {mockTests.map((test) => (
                            <MockTestCard
                                key={test._id || test.id}
                                test={test}
                            />
                        ))}

                    </div>
                )}

        </div>
    );
};

export default MockTests;