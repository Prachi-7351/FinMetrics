// server/routes/stressRoutes.js
import express from "express";
import {
  getBaseline,
  runSimulation,
  getScenarios,
  saveScenario,
  deleteScenario,
} from "../controllers/stressController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All stress routes are protected
router.use(protect);

router.get("/baseline",        getBaseline);
router.post("/simulate",       runSimulation);
router.get("/scenarios",       getScenarios);
router.post("/scenarios",      saveScenario);
router.delete("/scenarios/:id", deleteScenario);

export default router;
