// server/models/FinancialData.js
import mongoose from "mongoose";

// ─── Sub-schemas ──────────────────────────────────────────────────────────────
const transactionSchema = new mongoose.Schema({
  date:     { type: String, required: true },
  amount:   { type: Number, required: true },
  category: { type: String, default: "Uncategorized" },
  type:     { type: String, enum: ["Income", "Expense"], default: "Expense" },
}, { _id: true });

const budgetSchema = new mongoose.Schema({
  dept:      { type: String, required: true },
  allocated: { type: Number, default: 0 },
  spent:     { type: Number, default: 0 },
}, { _id: true });

const revenueStreamSchema = new mongoose.Schema({
  stream: { type: String, required: true },
  amount: { type: Number, default: 0 },
  growth: { type: Number, default: 0 },
}, { _id: true });

const stressScenarioSchema = new mongoose.Schema({
  id:      { type: String, required: true },
  name:    { type: String, required: true },
  tags:    [{ type: String }],
  params:  { type: mongoose.Schema.Types.Mixed, required: true },
  savedAt: { type: String },
}, { _id: false });

// ─── Main schema ──────────────────────────────────────────────────────────────
const financialDataSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },

    company: {
      name:        { type: String, default: "" },
      industry:    { type: String, default: "" },
      currency:    { type: String, default: "USD" },
      fiscal:      { type: String, default: "January – December" },
      cashBalance: { type: Number, default: 0 },
    },

    mode:       { type: String, default: "quick" },
    goals:      [{ type: String }],
    categories: [{ type: String }],

    transactions:    [transactionSchema],
    budgets:         [budgetSchema],
    revenueStreams:  [revenueStreamSchema],
    stressScenarios: [stressScenarioSchema],

    metrics: {
      totalRevenue:  { type: Number, default: 0 },
      totalExpenses: { type: Number, default: 0 },
      netBurn:       { type: Number, default: 0 },
      runwayMonths:  { type: Number, default: 0 },
      riskScore:     { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Recompute metrics before every save
// Synchronous pre-hook — no next() needed in Mongoose 8
financialDataSchema.pre("save", function () {
  const totalRevenue =
    this.transactions
      .filter(t => t.type === "Income")
      .reduce((s, t) => s + (t.amount || 0), 0)
    + this.revenueStreams.reduce((s, r) => s + (r.amount || 0), 0);

  const totalExpenses = this.transactions
    .filter(t => t.type === "Expense")
    .reduce((s, t) => s + (t.amount || 0), 0);

  const netBurn = Math.max(0, totalExpenses - totalRevenue);
  const runwayMonths = netBurn > 0
    ? parseFloat((this.company.cashBalance / netBurn).toFixed(1))
    : 0;

  let riskScore = 50;
  if (runwayMonths > 0 && runwayMonths < 3)  riskScore += 25;
  if (runwayMonths >= 3 && runwayMonths < 6) riskScore += 10;
  if (runwayMonths >= 6)                      riskScore -= 15;
  riskScore = Math.min(100, Math.max(0, riskScore));

  this.metrics = { totalRevenue, totalExpenses, netBurn, runwayMonths, riskScore };
});

export default mongoose.model("FinancialData", financialDataSchema);
