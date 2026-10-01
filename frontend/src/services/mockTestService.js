import api from "./api";

// Get all mock tests
const getAllMockTests = async () => {
    const response = await api.get("/mocktests");

    return response.data;
};

// Get a single mock test
const getMockTestById = async (testId) => {
    if (!testId) {
        throw new Error("Mock test ID is required.");
    }

    const response = await api.get(`/mocktests/${testId}`);

    return response.data;
};

// Create a mock test
const createMockTest = async (testData) => {
    const response = await api.post(
        "/mocktests",
        testData
    );

    return response.data;
};

// Update a mock test
const updateMockTest = async (testId, testData) => {
    if (!testId) {
        throw new Error("Mock test ID is required.");
    }

    const response = await api.put(
        `/mocktests/${testId}`,
        testData
    );

    return response.data;
};

// Delete a mock test
const deleteMockTest = async (testId) => {
    if (!testId) {
        throw new Error("Mock test ID is required.");
    }

    const response = await api.delete(
        `/mocktests/${testId}`
    );

    return response.data;
};

// Get questions for a mock test
const getTestQuestions = async (testId) => {
    if (!testId) {
        throw new Error("Mock test ID is required.");
    }

    /*
     * This endpoint will be added when we create
     * the Question backend system.
     */
    const response = await api.get(
        `/mocktests/${testId}/questions`
    );

    return response.data;
};

const mockTestService = {
    getAllMockTests,
    getMockTestById,
    createMockTest,
    updateMockTest,
    deleteMockTest,
    getTestQuestions,
};

export default mockTestService;