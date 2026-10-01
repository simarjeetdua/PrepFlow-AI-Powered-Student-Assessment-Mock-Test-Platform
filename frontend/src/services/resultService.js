import api from "./api";

// Get a single test result
const getResultById = async (resultId) => {
    if (!resultId) {
        throw new Error("Result ID is required.");
    }

    const response = await api.get(`/results/${resultId}`);

    return response.data;
};

// Submit a test attempt
const submitTest = async (testId, answers) => {
    if (!testId) {
        throw new Error("Mock test ID is required.");
    }

    const response = await api.post("/results", {
        testId,
        answers,
    });

    return response.data;
};

// Get all results for the logged-in student
const getMyResults = async () => {
    const response = await api.get("/results/my");

    return response.data;
};

// Get result for a specific mock test
const getResultByTestId = async (testId) => {
    if (!testId) {
        throw new Error("Mock test ID is required.");
    }

    const response = await api.get(
        `/results/test/${testId}`
    );

    return response.data;
};

const resultService = {
    getResultById,
    submitTest,
    getMyResults,
    getResultByTestId,
};

export default resultService;