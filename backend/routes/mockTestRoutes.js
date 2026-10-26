import express from "express"
import { getAllMockTests, getMockTestById, createMockTest , deleteMockTest, updateMockTest } from "../controllers/mockTestController.js"
import { protect } from "../middleware/authMiddleware.js"

const router = express.Router();

router.post("/",protect,createMockTest);
router.get("/", getAllMockTests);
router.get("/:id", getMockTestById);
router.put("/:id", protect,updateMockTest);
router.delete("/:id",protect, deleteMockTest);

export default router;