import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle,
} from "lucide-react";

import api from "../../services/api";

import TestTimer from "../../components/mocktest/TestTimer";
import TestProgress from "../../components/mocktest/TestProgress";
import QuestionCard from "../../components/mocktest/QuestionCard";
import TestNavigation from "../../components/mocktest/TestNavigation";

const TakeTest = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [test, setTest] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Track when the test started
    const [testStartedAt] = useState(Date.now());

    // Fetch test and questions
    useEffect(() => {
        const fetchTestData = async () => {
            try {
                setLoading(true);
                setError("");

                // Fetch mock test
                const testResponse = await api.get(
                    `/mocktests/${id}`
                );

                setTest(testResponse.data.mockTest);

                // Fetch questions
                const questionResponse = await api.get(
                    `/questions/test/${id}`
                );

                setQuestions(
                    questionResponse.data.questions || []
                );
            } catch (error) {
                console.error(
                    "Failed to load test:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Unable to load the test."
                );
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchTestData();
        }
    }, [id]);

    // Select answer
    const handleAnswerSelect = (answer) => {
        setAnswers((previousAnswers) => ({
            ...previousAnswers,
            [currentQuestion]: answer,
        }));
    };

    // Previous question
    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(
                (previousQuestion) =>
                    previousQuestion - 1
            );
        }
    };

    // Next question
    const handleNext = () => {
        if (
            currentQuestion <
            questions.length - 1
        ) {
            setCurrentQuestion(
                (previousQuestion) =>
                    previousQuestion + 1
            );
        }
    };

    // Submit test
    const handleSubmit = async () => {
        if (submitting) {
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to submit the test?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            /*
             * Convert frontend answers:
             *
             * {
             *   0: "MySQL",
             *   1: "SELECT"
             * }
             *
             * into:
             *
             * [
             *   {
             *     questionId: "...",
             *     selectedAnswer: "MySQL"
             *   }
             * ]
             */

            const formattedAnswers = questions.map(
                (question, index) => ({
                    questionId: question._id,
                    selectedAnswer:
                        answers[index] || "",
                })
            );

            // Calculate time taken in minutes
            const elapsedMilliseconds =
                Date.now() - testStartedAt;

            const timeTaken = Math.max(
                0,
                Math.round(
                    elapsedMilliseconds / 60000
                )
            );

            console.log(
                "Submitting test:",
                {
                    testId: id,
                    answers: formattedAnswers,
                    timeTaken,
                }
            );

            // Send answers to backend
            const response = await api.post(
                "/results",
                {
                    testId: id,
                    answers: formattedAnswers,
                    timeTaken,
                }
            );

            console.log(
                "Result response:",
                response.data
            );

            const resultId =
                response.data.resultId ||
                response.data.result?._id;

            if (!resultId) {
                throw new Error(
                    "Result ID was not returned by the server."
                );
            }

            // Go to actual result
            navigate(
                `/mock-tests/${id}/result/${resultId}`
            );
        } catch (error) {
            console.error(
                "Failed to submit test:",
                error
            );

            setError(
                error.response?.data?.message ||
                error.message ||
                "Unable to submit the test."
            );
        } finally {
            setSubmitting(false);
        }
    };

    // Timer finished
    const handleTimeUp = () => {
        if (!submitting) {
            handleSubmit();
        }
    };

    const answeredQuestions =
        Object.keys(answers).length;

    // Loading
    if (loading) {
        return (
            <div className="take-test-page">
                <div className="page-loading">
                    Loading test...
                </div>
            </div>
        );
    }

    // Error
    if (error && !test) {
        return (
            <div className="take-test-page">
                <div className="page-error">
                    <AlertCircle size={24} />

                    <h2>
                        Unable to load test
                    </h2>

                    <p>{error}</p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/mock-tests"
                            )
                        }
                    >
                        Back to Mock Tests
                    </button>
                </div>
            </div>
        );
    }

    // No questions
    if (
        test &&
        questions.length === 0
    ) {
        return (
            <div className="take-test-page">

                <button
                    type="button"
                    className="back-button"
                    onClick={() =>
                        navigate(
                            `/mock-tests/${id}`
                        )
                    }
                >
                    <ArrowLeft size={18} />
                    Back to Test Details
                </button>

                <div className="test-not-ready">

                    <div className="test-not-ready-icon">
                        <AlertCircle size={32} />
                    </div>

                    <h1>
                        {test.title}
                    </h1>

                    <h2>
                        Questions are not available yet
                    </h2>

                    <p>
                        This mock test currently
                        does not have any questions.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                `/mock-tests/${id}`
                            )
                        }
                        className="back-to-test-button"
                    >
                        Back to Test Details
                    </button>

                </div>
            </div>
        );
    }

    const currentQuestionData =
        questions[currentQuestion];

    return (
        <div className="take-test-page">

            {/* Header */}
            <div className="take-test-header">

                <div>
                    <button
                        type="button"
                        className="back-button"
                        onClick={() =>
                            navigate(
                                `/mock-tests/${id}`
                            )
                        }
                    >
                        <ArrowLeft size={18} />
                        Exit Test
                    </button>

                    <h1>
                        {test.title}
                    </h1>
                </div>

                <TestTimer
                    duration={test.duration}
                    onTimeUp={handleTimeUp}
                />

            </div>

            {/* Error while submitting */}
            {error && (
                <div className="mock-tests-error">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {/* Progress */}
            <TestProgress
                currentQuestion={
                    currentQuestion
                }
                totalQuestions={
                    questions.length
                }
                answeredQuestions={
                    answeredQuestions
                }
            />

            {/* Question */}
            <QuestionCard
                question={
                    currentQuestionData
                }
                questionNumber={
                    currentQuestion + 1
                }
                selectedAnswer={
                    answers[currentQuestion]
                }
                onAnswerSelect={
                    handleAnswerSelect
                }
            />

            {/* Navigation */}
            <TestNavigation
                currentQuestion={
                    currentQuestion
                }
                totalQuestions={
                    questions.length
                }
                onPrevious={
                    handlePrevious
                }
                onNext={handleNext}
                onSubmit={handleSubmit}
            />

            {/* Submission State */}
            {submitting && (
                <div className="submission-message">
                    <CheckCircle size={18} />
                    Submitting your test...
                </div>
            )}

        </div>
    );
};

export default TakeTest;