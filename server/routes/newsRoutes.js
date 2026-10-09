import express from "express";

import { fetchCompanyNews } from "../controllers/newsController.js";

const router = express.Router();

router.get("/news/:symbol", fetchCompanyNews);

export default router;