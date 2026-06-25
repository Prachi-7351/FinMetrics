import express from "express";
import { getAIInsights, getAIRecommendations, runStressTest } from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/insights",        protect, getAIInsights);
router.post("/recommendations", protect, getAIRecommendations);
router.post("/stress",          protect, runStressTest);

export default router;
