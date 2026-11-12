import { useEffect, useState, useMemo } from "react";
import {
    ClipboardList,
    AlertCircle,
    RefreshCw,
    Search,
    SlidersHorizontal,
    Sparkles,
} from "lucide-react";
import api from "../../services/api";
import MockTestCard from "../../components/mocktest/MockTestCard";

const MockTests = () => {
    const [mockTests, setMockTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDifficulty, setSelectedDifficulty] = useState("all");

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

    const filteredTests = useMemo(() => {
        return mockTests.filter((test) => {
            const matchesQuery =
                (test.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (test.description || "").toLowerCase().includes(searchQuery.toLowerCase());

            const matchesDifficulty =
                selectedDifficulty === "all" ||
                (test.difficulty || "").toLowerCase() === selectedDifficulty.toLowerCase();

            return matchesQuery && matchesDifficulty;
        });
    }, [mockTests, searchQuery, selectedDifficulty]);

    return (
        <div className="mock-tests-page">
            {/* Page Header */}
            <div className="mock-tests-page-header">
                <div className="page-header-content">
                    <div className="page-header-icon">
                        <ClipboardList size={22} strokeWidth={2.2} />
                    </div>

                    <div>
                        <div className="page-header-title-row">
                            <h1>Mock Tests & Assessments</h1>
                            {!loading && (
                                <span className="mock-test-count">
                                    {mockTests.length} Available
                                </span>
                            )}
                        </div>
                        <p>
                            Simulate exam conditions, test your topic readiness, and receive detailed scoring breakdowns.
                        </p>
                    </div>
                </div>

                <div className="header-actions-row">
                    <button
                        type="button"
                        onClick={fetchMockTests}
                        className="refresh-tests-btn"
                        disabled={loading}
                        title="Reload tests"
                    >
                        <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="mock-tests-toolbar">
                <div className="mock-tests-search-box">
                    <Search size={16} className="search-icon" />
                    <input
                        type="search"
                        placeholder="Search assessments by title or topic..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        aria-label="Search assessments"
                    />
                </div>

                <div className="mock-tests-filter-pills">
                    {["all", "easy", "medium", "hard"].map((diff) => (
                        <button
                            key={diff}
                            type="button"
                            className={`filter-pill ${selectedDifficulty === diff ? "active" : ""}`}
                            onClick={() => setSelectedDifficulty(diff)}
                        >
                            {diff === "all" ? "All Levels" : diff.charAt(0).toUpperCase() + diff.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading Skeletons */}
            {loading && (
                <div className="mock-tests-grid">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="mock-test-card-skeleton">
                            <div className="skeleton-line skeleton-badge" />
                            <div className="skeleton-line skeleton-title" />
                            <div className="skeleton-line skeleton-desc" />
                            <div className="skeleton-line skeleton-meta" />
                            <div className="skeleton-line skeleton-btn" />
                        </div>
                    ))}
                </div>
            )}

            {/* Error Banner */}
            {!loading && error && (
                <div className="mock-tests-error" role="alert">
                    <AlertCircle size={22} className="error-icon" />

                    <div className="error-body">
                        <h3>Unable to load assessments</h3>
                        <p>{error}</p>
                    </div>

                    <button
                        type="button"
                        onClick={fetchMockTests}
                        className="retry-button"
                    >
                        <RefreshCw size={15} />
                        <span>Try Again</span>
                    </button>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredTests.length === 0 && (
                <div className="mock-tests-empty">
                    <div className="empty-icon-wrap">
                        <ClipboardList size={32} />
                    </div>

                    <h2>
                        {searchQuery || selectedDifficulty !== "all"
                            ? "No assessments found"
                            : "No Mock Tests Available Yet"}
                    </h2>

                    <p>
                        {searchQuery || selectedDifficulty !== "all"
                            ? "Try adjusting your search criteria or resetting filters to view all assessments."
                            : "New assessments are currently being generated. Check back shortly."}
                    </p>

                    {(searchQuery || selectedDifficulty !== "all") && (
                        <button
                            type="button"
                            className="empty-reset-btn"
                            onClick={() => {
                                setSearchQuery("");
                                setSelectedDifficulty("all");
                            }}
                        >
                            Reset filters
                        </button>
                    )}
                </div>
            )}

            {/* Mock Tests Grid */}
            {!loading && !error && filteredTests.length > 0 && (
                <div className="mock-tests-grid">
                    {filteredTests.map((test) => (
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
