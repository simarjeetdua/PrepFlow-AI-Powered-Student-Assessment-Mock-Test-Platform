import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    AlertCircle,
    ArrowLeft,
    Home,
    ClipboardList,
} from "lucide-react";

import api from "../../services/api";

import ScoreCard from "../../components/result/ScoreCard";
import ResultSummary from "../../components/result/ResultSummary";
import AnswerReview from "../../components/result/AnswerReview";

const TestResult = () => {
    const { id, resultId } = useParams();
    const navigate = useNavigate();

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchResult = async () => {
            try {
                setLoading(true);
                setError("");

                if (!resultId) {
                    setError("Result ID is missing.");
                    return;
                }

                const response = await api.get(
                    `/results/${resultId}`
                );

                setResult(response.data.result);
            } catch (error) {
                console.error(
                    "Failed to fetch result:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Unable to load test result."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchResult();
    }, [resultId]);

    // Loading
    if (loading) {
        return (
            <div className="test-result-page">
                <div className="page-loading">
                    Loading result...
                </div>
            </div>
        );
    }

    // Error
    if (error || !result) {
        return (
            <div className="test-result-page">

                <button
                    type="button"
                    className="back-button"
                    onClick={() =>
                        navigate("/mock-tests")
                    }
                >
                    <ArrowLeft size={18} />
                    Back to Mock Tests
                </button>

                <div className="result-not-available">

                    <div className="result-error-icon">
                        <AlertCircle size={32} />
                    </div>

                    <h1>
                        Result Not Available
                    </h1>

                    <p>
                        {error ||
                            "The test result could not be found."}
                    </p>

                    <div className="result-actions">

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/mock-tests"
                                )
                            }
                            className="result-action-button"
                        >
                            <ClipboardList size={18} />
                            View Mock Tests
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/dashboard"
                                )
                            }
                            className="result-action-button secondary"
                        >
                            <Home size={18} />
                            Dashboard
                        </button>

                    </div>

                </div>

            </div>
        );
    }

    // Backend result data
    const testId =
        result.mockTest?._id ||
        result.mockTest ||
        id;

    const duration =
        result.timeTaken ?? 0;

    return (
        <div className="test-result-page">

            {/* Header */}
            <div className="test-result-header">

                <button
                    type="button"
                    className="back-button"
                    onClick={() =>
                        navigate("/mock-tests")
                    }
                >
                    <ArrowLeft size={18} />
                    Back to Mock Tests
                </button>

                <div>
                    <h1>
                        Test Result
                    </h1>

                    <p>
                        {result.mockTest?.title ||
                            "Review your mock test performance."}
                    </p>
                </div>

            </div>

            {/* Score Card */}
            <ScoreCard
                score={result.score}
                totalQuestions={
                    result.totalQuestions
                }
                correctAnswers={
                    result.correctAnswers
                }
                testId={testId}
            />

            {/* Result Summary */}
            <ResultSummary
                score={result.score}
                totalQuestions={
                    result.totalQuestions
                }
                correctAnswers={
                    result.correctAnswers
                }
                incorrectAnswers={
                    result.incorrectAnswers
                }
                unanswered={
                    result.unanswered
                }
                duration={duration}
            />

            {/* Answer Review */}
            <AnswerReview
                answers={(
                    result.answers || []
                ).map((answer) => ({
                    id: answer.question?._id,
                    question:
                        answer.question?.questionText ||
                        "Question",
                    selectedAnswer:
                        answer.selectedAnswer,
                    correctAnswer:
                        answer.correctAnswer,
                    isCorrect:
                        answer.isCorrect,
                }))}
            />

            {/* Bottom Actions */}
            <div className="result-bottom-actions">

                <button
                    type="button"
                    className="result-action-button"
                    onClick={() =>
                        navigate("/mock-tests")
                    }
                >
                    <ClipboardList size={18} />
                    Take Another Test
                </button>

                <button
                    type="button"
                    className="result-action-button secondary"
                    onClick={() =>
                        navigate("/dashboard")
                    }
                >
                    <Home size={18} />
                    Go to Dashboard
                </button>

            </div>

        </div>
    );
};

export default TestResult;