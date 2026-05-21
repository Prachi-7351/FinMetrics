import express from "express";
import {
  getFinancialData, saveOnboarding, updateCompany,
  updateTransactions, updateBudgets, updateRevenue,
  getMetrics, getRiskData,
} from "../controllers/financialController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All financial routes are protected
router.use(protect);

router.get("/",                getFinancialData);
router.get("/metrics",         getMetrics);
router.get("/risk",            getRiskData);
router.post("/onboarding",     saveOnboarding);
router.put("/company",         updateCompany);
router.put("/transactions",    updateTransactions);
router.put("/budgets",         updateBudgets);
router.put("/revenue",         updateRevenue);

export default router;
