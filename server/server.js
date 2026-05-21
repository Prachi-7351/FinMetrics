// server/server.js  (updated — add the stress route)
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import authRoutes      from "./routes/authRoutes.js";
import financialRoutes from "./routes/financialRoutes.js";
import aiRoutes        from "./routes/aiRoutes.js";
import stressRoutes    from "./routes/stressRoutes.js";   // ← NEW

dotenv.config();

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/auth",      authRoutes);
app.use("/api/financial", financialRoutes);
app.use("/api/ai",        aiRoutes);
app.use("/api/stress",    stressRoutes);              // ← NEW

// Health check
app.get("/api/health", (_, res) => res.json({ status: "ok", time: new Date() }));

// ─── MongoDB ──────────────────────────────────────────────────────────────────
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅  MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("❌  MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀  Server running on http://localhost:${PORT}`));
});
