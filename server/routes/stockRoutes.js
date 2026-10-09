import express from "express";

import {
  fetchStockQuote,
  fetchCompanyDetails,
} from "../controllers/stockController.js";

const router = express.Router();

router.get("/stock/:symbol", fetchStockQuote);

router.get("/company/:symbol", fetchCompanyDetails);

export default router;