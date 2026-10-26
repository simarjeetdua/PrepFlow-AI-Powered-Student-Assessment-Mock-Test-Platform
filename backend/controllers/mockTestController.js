import MockTest from "../models/MockTest.js";

// now we create the mocktest
export const createMockTest = async (req, res) => {
    try {
        const {title,description,duration,totalQuestions,difficulty,status,} = req.body;

        if (!title ||!description ||!duration ||!totalQuestions ||!difficulty ||!status
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields",
            });
        }

        const mockTest = await MockTest.create({title, description, duration,totalQuestions,difficulty,status, createdBy: req.student._id});

        res.status(201).json({
            success: true,
            message: "Mock Test created successfully",
            mockTest,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// fetching all mocktests by find()
export const getAllMockTests = async (req, res) => {
    try {
        const mockTests = await MockTest.find();

        res.status(200).json({
            success: true,
            count: mockTests.length,
            mockTests,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// fetching only single mocktest by findbyid()
export const getMockTestById = async (req, res) => {
    try {
        const mockTest = await MockTest.findById(req.params.id);

        if (!mockTest) {
            return res.status(404).json({
                success: false,
                message: "Mock Test not found",
            });
        }

        res.status(200).json({
            success: true,
            mockTest,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// now we Update Mock Test by findByIdAndUpdate
export const updateMockTest = async (req, res) => {
    try {
        const {title,description,duration,totalQuestions,difficulty,status,} = req.body;

        // now we Validate required fields
        if (!title || !description || !duration || !totalQuestions || !difficulty || !status)
             {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields",
            });
        }

        const mockTest = await MockTest.findByIdAndUpdate(req.params.id,
            {title,description,duration,totalQuestions,difficulty,status},
            {
                new: true,
                runValidators: true,
            }
        );

        if (!mockTest) {
            return res.status(404).json({
                success: false,
                message: "Mock Test not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Mock Test updated successfully",
            mockTest,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Delete Mock Test
export const deleteMockTest = async (req, res) => {
    try {
        const mockTest = await MockTest.findByIdAndDelete(req.params.id);

        if (!mockTest) {
            return res.status(404).json({
                success: false,
                message: "Mock Test not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Mock Test deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};