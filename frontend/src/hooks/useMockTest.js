import { useCallback, useEffect, useState } from "react";
import api from "../services/api";

const useMockTest = (testId = null) => {
    const [mockTests, setMockTests] = useState([]);
    const [test, setTest] = useState(null);
    const [questions, setQuestions] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Fetch all mock tests
    const fetchMockTests = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/mocktests");

            setMockTests(response.data.mockTests || []);

            return response.data.mockTests || [];
        } catch (error) {
            console.error(
                "Failed to fetch mock tests:",
                error
            );

            const message =
                error.response?.data?.message ||
                "Unable to load mock tests.";

            setError(message);

            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch a single mock test
    const fetchMockTest = useCallback(async (id) => {
        if (!id) {
            return null;
        }

        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/mocktests/${id}`
            );

            const mockTest = response.data.mockTest;

            setTest(mockTest);

            return mockTest;
        } catch (error) {
            console.error(
                "Failed to fetch mock test:",
                error
            );

            const message =
                error.response?.data?.message ||
                "Unable to load mock test.";

            setError(message);

            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch questions
    const fetchQuestions = useCallback(async (id) => {
    if (!id) return [];

    try {
        setLoading(true);
        setError("");

        const response = await api.get(
            `/questions/test/${id}`
        );

        const testQuestions =
            response.data.questions || [];

        setQuestions(testQuestions);

        return testQuestions;
    } catch (error) {
        console.error("Failed to fetch questions:", error);

        const message =
            error.response?.data?.message ||
            "Unable to load test questions.";

        setError(message);

        return [];
    } finally {
        setLoading(false);
    }
}, []);
};

export default useMockTest;