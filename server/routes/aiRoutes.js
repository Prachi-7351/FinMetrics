import express from "express";

import {protect} from "../middleware/authMiddleware.js";

import {

    aiCFO,

    getAIRecommendations,

    getAIInsights,

    runStressTest

} from "../controllers/aiController.js";

const router = express.Router();

router.post("/cfo", protect, aiCFO);

router.post("/recommendations", protect, getAIRecommendations);

router.post("/insights", protect, getAIInsights);

router.post("/stress", protect, runStressTest);

export default router;