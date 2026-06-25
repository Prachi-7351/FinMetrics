// server/controllers/stressController.js
import FinancialData from "../models/FinancialData.js";

// ─── Helper: derive baseline from the user's real DB data ─────────────────────
function buildBaseline(data) {
  const { metrics, company, transactions, budgets, revenueStreams } = data;

  // Monthly revenue: cached metric + any income transactions averaged monthly
  const incomeTransactions = transactions.filter((t) => t.type === "Income");
  const expenseTransactions = transactions.filter((t) => t.type === "Expense");

  // Attempt to spread transactions across months (use count as monthly proxy)
  const txMonths = Math.max(1, new Set(incomeTransactions.map((t) => t.date?.slice(0, 7))).size);
  const txRevenue = incomeTransactions.reduce((s, t) => s + t.amount, 0) / txMonths;
  const txExpenses = expenseTransactions.reduce((s, t) => s + t.amount, 0) / txMonths;
  const streamRevenue = revenueStreams.reduce((s, r) => s + r.amount, 0);

  const revenue = Math.max(txRevenue + streamRevenue, 1);
  const expenses = Math.max(txExpenses, 1);
  const cashBalance = company.cashBalance || 0;
  const netBurn = Math.max(expenses - revenue, 0);
  const runwayMonths = netBurn > 0 ? parseFloat((cashBalance / netBurn).toFixed(1)) : 24;
  const riskScore = metrics.riskScore || 50;
  const headCount = Math.max(1, Math.round(expenses / 6000)); // rough proxy

  return {
    cash: cashBalance,
    revenue: Math.round(revenue),
    expenses: Math.round(expenses),
    debtPayment: 0,
    runway: runwayMonths > 24 ? 24 : runwayMonths,
    riskScore,
    riskLevel: riskScore >= 70 ? "High" : riskScore >= 44 ? "Medium" : "Low",
    headCount,
    headCostPerMonth: Math.round(expenses / Math.max(headCount, 1)),
    marketingPctOfExpenses: 0.15,
    companyName: company.name || "Your Company",
    industry: company.industry || "",
    currency: company.currency || "USD",
  };
}

// ─── Core simulation engine (pure function) ───────────────────────────────────
function computeScenario(baseline, params) {
  const shockFactor = { None: 0, Low: -0.04, Med: -0.10, High: -0.20 }[params.marketShock] ?? 0;

  const newRevenue = baseline.revenue * (1 + params.revenuePct / 100 + shockFactor);
  const mktBaseCost = baseline.expenses * baseline.marketingPctOfExpenses;
  const mktDelta = mktBaseCost * (params.marketingPct / 100);
  const hireDelta = params.hiring * baseline.headCostPerMonth;
  const newExpenses = baseline.expenses * (1 + params.expensePct / 100) + mktDelta + hireDelta;
  const debtAdj = params.hasDebt ? (baseline.debtPayment || 5000) * (1 + (params.interestPct || 0) / 100) : 0;
  const investBoost = baseline.cash * (params.investPct / 100);
  const startCash = baseline.cash + investBoost;

  const monthlyBurn = newExpenses + debtAdj - newRevenue;
  const baselineBurn = Math.max(baseline.expenses - baseline.revenue, 0);
  const netBurn = Math.max(monthlyBurn, 0);
  const burnChangePct =
    baselineBurn > 0
      ? parseFloat(((netBurn - baselineBurn) / baselineBurn * 100).toFixed(1))
      : parseFloat((netBurn * 100).toFixed(1));

  const runwayRaw = netBurn <= 0 ? 24 : Math.max(0, startCash / netBurn);
  const runway = parseFloat(Math.min(runwayRaw, 24).toFixed(1));

  const runwayRisk = runway < 3 ? 42 : runway < 6 ? 22 : 6;
  const burnRisk = burnChangePct > 30 ? 28 : burnChangePct > 15 ? 16 : burnChangePct > 0 ? 8 : 0;
  const shockRisk = { None: 0, Low: 5, Med: 13, High: 25 }[params.marketShock] ?? 0;
  const hireRisk = params.hiring > 4 ? 10 : params.hiring < -2 ? 2 : 0;
  const riskScore = Math.min(100, Math.round(baseline.riskScore + runwayRisk + burnRisk + shockRisk + hireRisk));
  const riskLevel = riskScore >= 70 ? "High" : riskScore >= 44 ? "Medium" : "Low";

  const survivalPct =
    runway >= 12 ? 94 : runway >= 9 ? 83 : runway >= 6 ? 71 : runway >= 3 ? 48 : 20;

  const simLine = Array.from({ length: 13 }, (_, m) => ({
    month: m,
    simCash: Math.max(0, startCash - netBurn * m),
    baseCash: Math.max(0, baseline.cash - baselineBurn * m),
  }));

  const cashoutMonth =
    netBurn > 0 && startCash / netBurn < 12
      ? Math.ceil(startCash / netBurn)
      : null;

  const revDelta = parseFloat(((newRevenue - baseline.revenue) / baseline.revenue * 100).toFixed(0));

  return {
    newRevenue: Math.round(newRevenue),
    newExpenses: Math.round(newExpenses),
    netBurn: Math.round(netBurn),
    burnChangePct,
    runway,
    riskScore,
    riskLevel,
    survivalPct,
    simLine,
    cashoutMonth,
    startCash: Math.round(startCash),
    revDelta,
    runwayDelta: parseFloat((runway - baseline.runway).toFixed(1)),
    scoreDelta: riskScore - baseline.riskScore,
  };
}

// ─── GET /api/stress/baseline ──────────────────────────────────────────────────
export const getBaseline = async (req, res) => {
  try {
    let data = await FinancialData.findOne({ userId: req.userId });
    if (!data) data = await FinancialData.create({ userId: req.userId });
    const baseline = buildBaseline(data);
    res.json({ baseline });
  } catch (err) {
    console.error("[stress/baseline]", err);
    res.status(500).json({ error: "Failed to load baseline data." });
  }
};

// ─── POST /api/stress/simulate ─────────────────────────────────────────────────
export const runSimulation = async (req, res) => {
  try {
    const data = await FinancialData.findOne({ userId: req.userId });
    if (!data) return res.status(404).json({ error: "No financial data found. Complete onboarding first." });

    const baseline = buildBaseline(data);
    const params = req.body.params;

    if (!params) return res.status(400).json({ error: "Simulation params required." });

    const result = computeScenario(baseline, params);
    res.json({ baseline, result });
  } catch (err) {
    console.error("[stress/simulate]", err);
    res.status(500).json({ error: "Simulation failed." });
  }
};

// ─── GET /api/stress/scenarios ─────────────────────────────────────────────────
// Returns saved stress scenarios for this user
export const getScenarios = async (req, res) => {
  try {
    const data = await FinancialData.findOne({ userId: req.userId });
    if (!data) return res.json({ scenarios: [] });
    res.json({ scenarios: data.stressScenarios || [] });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch scenarios." });
  }
};

// ─── POST /api/stress/scenarios ────────────────────────────────────────────────
// Save a new scenario
export const saveScenario = async (req, res) => {
  try {
    const { name, params, tags } = req.body;
    if (!name || !params) return res.status(400).json({ error: "name and params required." });

    const data = await FinancialData.findOne({ userId: req.userId });
    if (!data) return res.status(404).json({ error: "No financial data found." });

    if (!data.stressScenarios) data.stressScenarios = [];

    const scenario = {
      id: Date.now().toString(),
      name,
      params,
      tags: tags || [],
      savedAt: new Date().toISOString(),
    };
    data.stressScenarios.push(scenario);
    data.markModified("stressScenarios");
    await data.save();

    res.json({ scenario, scenarios: data.stressScenarios });
  } catch (err) {
    res.status(500).json({ error: "Failed to save scenario." });
  }
};

// ─── DELETE /api/stress/scenarios/:id ──────────────────────────────────────────
export const deleteScenario = async (req, res) => {
  try {
    const data = await FinancialData.findOne({ userId: req.userId });
    if (!data) return res.status(404).json({ error: "No financial data found." });

    data.stressScenarios = (data.stressScenarios || []).filter((s) => s.id !== req.params.id);
    data.markModified("stressScenarios");
    await data.save();

    res.json({ scenarios: data.stressScenarios });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete scenario." });
  }
};
