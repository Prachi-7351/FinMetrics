import FinancialData from "../models/FinancialData.js";

// GET /api/financial  — get (or create) this user's financial data
export const getFinancialData = async (req, res) => {
  try {
    let data = await FinancialData.findOne({ userId: req.userId });
    if (!data) {
      data = await FinancialData.create({ userId: req.userId });
    }
    res.json({ data });
  } catch (err) {
    console.error("[getFinancialData]", err);
    res.status(500).json({ error: "Could not fetch financial data." });
  }
};

// POST /api/financial/onboarding  — save full onboarding payload
export const saveOnboarding = async (req, res) => {
  try {
    const { company, mode, transactions, budgets, revenue, categories, goals } = req.body;

    let data = await FinancialData.findOne({ userId: req.userId });
    if (!data) data = new FinancialData({ userId: req.userId });

    data.company       = company       || data.company;
    data.mode          = mode          || data.mode;
    data.transactions  = transactions  || [];
    data.budgets       = budgets       || [];
    data.revenueStreams = revenue       || [];
    data.categories    = categories    || [];
    data.goals         = goals         || [];

    await data.save(); // triggers metric recompute

    // mark onboarding complete on User model
    const { default: User } = await import("../models/User.js");
    await User.findByIdAndUpdate(req.userId, { onboardingComplete: true });

    res.json({ data });
  } catch (err) {
    console.error("[saveOnboarding]", err);
    res.status(500).json({ error: "Failed to save onboarding data." });
  }
};

// PUT /api/financial/company  — update company info from Profile page
export const updateCompany = async (req, res) => {
  try {
    let data = await FinancialData.findOne({ userId: req.userId });
    if (!data) return res.status(404).json({ error: "No financial data found." });

    data.company = { ...data.company.toObject(), ...req.body };
    await data.save();
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: "Failed to update company data." });
  }
};

// PUT /api/financial/transactions
export const updateTransactions = async (req, res) => {
  try {
    let data = await FinancialData.findOne({ userId: req.userId });
    if (!data) return res.status(404).json({ error: "No financial data found." });

    data.transactions = req.body.transactions || [];
    await data.save();
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: "Failed to update transactions." });
  }
};

// PUT /api/financial/budgets
export const updateBudgets = async (req, res) => {
  try {
    let data = await FinancialData.findOne({ userId: req.userId });
    if (!data) return res.status(404).json({ error: "No financial data found." });

    data.budgets = req.body.budgets || [];
    await data.save();
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: "Failed to update budgets." });
  }
};

// PUT /api/financial/revenue
export const updateRevenue = async (req, res) => {
  try {
    let data = await FinancialData.findOne({ userId: req.userId });
    if (!data) return res.status(404).json({ error: "No financial data found." });

    data.revenueStreams = req.body.revenue || [];
    await data.save();
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: "Failed to update revenue." });
  }
};

// GET /api/financial/metrics  — computed metrics for Dashboard, RiskRadar, etc.
export const getMetrics = async (req, res) => {
  try {
    const data = await FinancialData.findOne({ userId: req.userId });
    if (!data) return res.json({ metrics: {} });
    res.json({ metrics: data.metrics, company: data.company });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch metrics." });
  }
};

// ─── Helper: derive trend data from dated transactions ────────────────────────
function buildTrendData(transactions, runwayMonths, riskScore, netBurn, days) {
  // Group expenses by date bucket
  const now = new Date();
  const buckets = days === 7 ? 7 : days === 30 ? 8 : 8;
  const result = [];

  for (let i = buckets - 1; i >= 0; i--) {
    const bucketDate = new Date(now);
    bucketDate.setDate(now.getDate() - Math.round((i / (buckets - 1)) * (days - 1)));

    const label = days === 7
      ? bucketDate.toLocaleDateString("en-US", { weekday: "short" })
      : bucketDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    // Transactions up to this date
    const txUpToDate = transactions.filter(t => new Date(t.date) <= bucketDate);
    const incomeUpTo = txUpToDate.filter(t => t.type === "Income").reduce((s, t) => s + t.amount, 0);
    const expenseUpTo = txUpToDate.filter(t => t.type === "Expense").reduce((s, t) => s + t.amount, 0);
    const burnUpTo = Math.max(0, expenseUpTo - incomeUpTo);

    // Decay runway backwards in time proportionally
    const dayFraction = i / (buckets - 1);
    const histRunway = parseFloat((runwayMonths * (1 + dayFraction * 0.35)).toFixed(1));
    const histScore = Math.max(10, Math.round(riskScore * (1 - dayFraction * 0.4)));
    const burnPct = burnUpTo > 0 && netBurn > 0
      ? Math.round((burnUpTo / netBurn) * netBurn / 1000)
      : Math.round(netBurn / 1000 * (1 - dayFraction * 0.4));

    result.push({
      day: label,
      score: histScore,
      runway: histRunway,
      burn: Math.max(0, burnPct),
      alert: histScore > 60 && i % 2 === 0,
    });
  }

  return result;
}

// ─── Helper: generate alerts from real data ───────────────────────────────────
function buildAlerts(metrics, budgets, transactions) {
  const alerts = [];
  let id = 1;
  const now = new Date();

  if (metrics.runwayMonths > 0 && metrics.runwayMonths < 3) {
    alerts.push({
      id: id++,
      timestamp: "Just now",
      category: "Liquidity",
      message: `Runway dropped to ${metrics.runwayMonths.toFixed(1)} months — below 3-month minimum`,
      isNew: true,
    });
  }

  // Burn acceleration check
  if (metrics.netBurn > 0) {
    const burnK = (metrics.netBurn / 1000).toFixed(1);
    alerts.push({
      id: id++,
      timestamp: "Today",
      category: "Burn",
      message: `Monthly net burn at $${burnK}K — review expense categories`,
      isNew: metrics.runwayMonths < 4,
    });
  }

  // Over-budget departments
  const overBudget = budgets.filter(b => b.spent > b.allocated);
  overBudget.forEach((b, i) => {
    const pct = Math.round(((b.spent - b.allocated) / b.allocated) * 100);
    const d = new Date(now);
    d.setDate(now.getDate() - (i + 1));
    alerts.push({
      id: id++,
      timestamp: i === 0 ? "Yesterday" : `${i + 1} days ago`,
      category: "Budget",
      message: `${b.dept} spend exceeded budget by ${pct}% ($${(b.spent - b.allocated).toLocaleString()} over)`,
      isNew: false,
    });
  });

  // Revenue below expenses
  if (metrics.totalExpenses > metrics.totalRevenue && metrics.totalRevenue > 0) {
    alerts.push({
      id: id++,
      timestamp: "3 days ago",
      category: "Burn",
      message: `Expenses ($${(metrics.totalExpenses / 1000).toFixed(1)}K) exceed revenue ($${(metrics.totalRevenue / 1000).toFixed(1)}K) this period`,
      isNew: false,
    });
  }

  // Cash balance warning
  if (metrics.runwayMonths >= 3 && metrics.runwayMonths < 6) {
    alerts.push({
      id: id++,
      timestamp: "5 days ago",
      category: "Liquidity",
      message: `Cash reserves support ${metrics.runwayMonths.toFixed(1)} months runway — monitor closely`,
      isNew: false,
    });
  }

  // Healthy signal if low risk
  if (metrics.riskScore < 40) {
    alerts.push({
      id: id++,
      timestamp: "1 week ago",
      category: "Market",
      message: "Financial health indicators within normal range",
      isNew: false,
    });
  }

  return alerts.slice(0, 8); // cap at 8 alerts
}

// ─── Helper: top risk reasons ─────────────────────────────────────────────────
function buildTopReasons(metrics, budgets) {
  const reasons = [];
  let id = 1;

  if (metrics.runwayMonths > 0 && metrics.runwayMonths < 3) {
    reasons.push({
      id: id++,
      severity: "critical",
      title: `Runway below 3 months (${metrics.runwayMonths.toFixed(1)} mo)`,
      detail: `At current burn rate of $${(metrics.netBurn / 1000).toFixed(1)}K/mo, cash reserves will be depleted in approximately ${metrics.runwayMonths.toFixed(1)} months — below the recommended 3-month minimum buffer.`,
    });
  }

  if (metrics.netBurn > 0) {
    const burnK = (metrics.netBurn / 1000).toFixed(1);
    reasons.push({
      id: id++,
      severity: metrics.runwayMonths < 3 ? "high" : "medium",
      title: `Net burn rate at $${burnK}K per month`,
      detail: `Operational expenses exceed revenue by $${burnK}K monthly. Total expenses: $${(metrics.totalExpenses / 1000).toFixed(1)}K vs revenue: $${(metrics.totalRevenue / 1000).toFixed(1)}K.`,
    });
  }

  const overBudget = budgets.filter(b => b.spent > b.allocated);
  if (overBudget.length > 0) {
    const depts = overBudget.map(b => b.dept).join(", ");
    reasons.push({
      id: id++,
      severity: "medium",
      title: `Overspending in ${overBudget.length} department${overBudget.length > 1 ? "s" : ""}`,
      detail: `${depts} ${overBudget.length > 1 ? "are" : "is"} exceeding allocated budgets. Review and realign departmental spend to reduce budget variance.`,
    });
  }

  if (metrics.totalRevenue === 0 && metrics.totalExpenses === 0) {
    reasons.push({
      id: id++,
      severity: "medium",
      title: "No financial data recorded yet",
      detail: "Add transactions via the Data page to get accurate risk analysis. Risk scores are based on your actual revenue, expenses, and cash balance.",
    });
  }

  // If everything is healthy
  if (reasons.length === 0) {
    reasons.push({
      id: id++,
      severity: "stable",
      title: "Financial health indicators are stable",
      detail: "Runway exceeds 6 months, burn rate is manageable, and budget variances are within acceptable limits. Continue monitoring for changes.",
    });
  }

  return reasons;
}

// ─── Helper: signals table ────────────────────────────────────────────────────
function buildSignalsTable(metrics, budgets, cashBalance) {
  const overBudget = budgets.filter(b => b.spent > b.allocated);
  const cashDays = metrics.netBurn > 0
    ? Math.round((cashBalance / metrics.netBurn) * 30)
    : 999;

  return [
    {
      metric: "Runway",
      current: metrics.runwayMonths > 0 ? `${metrics.runwayMonths.toFixed(1)} mo` : "N/A",
      threshold: "3.0 mo",
      status: metrics.runwayMonths > 0 && metrics.runwayMonths < 3 ? "Critical"
            : metrics.runwayMonths < 6 ? "Watch" : "Stable",
    },
    {
      metric: "Net Burn Rate",
      current: metrics.netBurn > 0 ? `$${(metrics.netBurn / 1000).toFixed(1)}K/mo` : "$0",
      threshold: "$0 (break-even)",
      status: metrics.netBurn > 0 ? (metrics.netBurn > 50000 ? "Critical" : "Watch") : "Stable",
    },
    {
      metric: "Budget Overruns",
      current: `${overBudget.length} dept${overBudget.length !== 1 ? "s" : ""}`,
      threshold: "0 depts",
      status: overBudget.length === 0 ? "Stable" : overBudget.length > 2 ? "Critical" : "Watch",
    },
    {
      metric: "Cash Coverage",
      current: cashDays < 999 ? `${cashDays} days` : "∞",
      threshold: "90 days",
      status: cashDays < 60 ? "Critical" : cashDays < 90 ? "Watch" : "Stable",
    },
    {
      metric: "Total Revenue",
      current: metrics.totalRevenue > 0 ? `$${(metrics.totalRevenue / 1000).toFixed(1)}K` : "$0",
      threshold: "> Expenses",
      status: metrics.totalRevenue >= metrics.totalExpenses ? "Stable" : "Watch",
    },
    {
      metric: "Expense Ratio",
      current: metrics.totalRevenue > 0
        ? `${Math.round((metrics.totalExpenses / metrics.totalRevenue) * 100)}%`
        : "N/A",
      threshold: "< 100%",
      status: metrics.totalRevenue > 0 && metrics.totalExpenses > metrics.totalRevenue
        ? "Critical"
        : metrics.totalRevenue > 0 && (metrics.totalExpenses / metrics.totalRevenue) > 0.85
        ? "Watch"
        : "Stable",
    },
  ];
}

// ─── Helper: recommended actions ──────────────────────────────────────────────
function buildRecommendedActions(metrics, budgets) {
  const actions = [];
  let id = 1;

  if (metrics.runwayMonths > 0 && metrics.runwayMonths < 3) {
    actions.push({
      id: id++,
      priority: "immediate",
      action: "Cut discretionary spend by 15–20% immediately",
      impact: `Could extend runway to ~${(metrics.runwayMonths * 1.2).toFixed(1)} months`,
    });
    actions.push({
      id: id++,
      priority: "immediate",
      action: "Begin fundraising or credit line conversations now",
      impact: "Ensures 90-day runway buffer ahead of depletion",
    });
  } else if (metrics.runwayMonths < 6) {
    actions.push({
      id: id++,
      priority: "soon",
      action: "Review and reduce non-essential operating expenses",
      impact: "Improves runway by 1–2 months",
    });
    actions.push({
      id: id++,
      priority: "soon",
      action: "Accelerate revenue collection and invoicing",
      impact: "Improves cash position immediately",
    });
  }

  const overBudget = budgets.filter(b => b.spent > b.allocated);
  if (overBudget.length > 0) {
    actions.push({
      id: id++,
      priority: metrics.runwayMonths < 3 ? "immediate" : "soon",
      action: `Realign ${overBudget.map(b => b.dept).join(" & ")} budgets to plan`,
      impact: "Reduces budget variance and improves predictability",
    });
  }

  actions.push({
    id: id++,
    priority: "plan",
    action: "Set automated runway threshold alerts at 60 and 90 days",
    impact: "Early warning system for cash management",
  });

  if (metrics.riskScore < 40) {
    actions.push({
      id: id++,
      priority: "plan",
      action: "Consider reinvesting surplus into growth channels",
      impact: "Maintain healthy growth while staying cash-positive",
    });
  }

  return actions.slice(0, 4);
}

// ─── Helper: driver scores ────────────────────────────────────────────────────
function buildDrivers(metrics, budgets) {
  const overBudget = budgets.filter(b => b.spent > b.allocated);

  // Liquidity: based on runway
  const liquidityScore = metrics.runwayMonths <= 0 ? 50
    : metrics.runwayMonths < 2 ? 90
    : metrics.runwayMonths < 3 ? 75
    : metrics.runwayMonths < 6 ? 50
    : 25;

  // Burn: based on net burn vs revenue
  const burnRatio = metrics.totalRevenue > 0
    ? metrics.netBurn / metrics.totalRevenue
    : metrics.netBurn > 0 ? 1 : 0;
  const burnScore = Math.min(95, Math.round(20 + burnRatio * 75));

  // Budget variance: based on overruns
  const totalBudgeted = budgets.reduce((s, b) => s + b.allocated, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const budgetVariancePct = totalBudgeted > 0
    ? Math.max(0, (totalSpent - totalBudgeted) / totalBudgeted)
    : 0;
  const budgetScore = Math.min(85, Math.round(15 + budgetVariancePct * 100 + overBudget.length * 10));

  // Market signal: static for now (no external data)
  const marketScore = 38;

  return [
    {
      id: "liquidity",
      label: "Liquidity Risk",
      score: liquidityScore,
      trend: liquidityScore > 50 ? +Math.round(liquidityScore * 0.1) : -5,
      status: liquidityScore >= 75 ? "Critical" : liquidityScore >= 50 ? "Watch" : "Stable",
      detail: `Runway: ${metrics.runwayMonths > 0 ? metrics.runwayMonths.toFixed(1) + " months" : "N/A"}. Measures available cash relative to monthly burn obligations.`,
    },
    {
      id: "burn",
      label: "Burn Risk",
      score: burnScore,
      trend: burnScore > 50 ? +Math.round(burnScore * 0.08) : -3,
      status: burnScore >= 75 ? "Critical" : burnScore >= 50 ? "Watch" : "Stable",
      detail: `Net burn: $${(metrics.netBurn / 1000).toFixed(1)}K/mo vs revenue $${(metrics.totalRevenue / 1000).toFixed(1)}K/mo. ${burnRatio > 0.5 ? "Expenses significantly outpacing revenue." : "Burn rate manageable."}`,
    },
    {
      id: "budget",
      label: "Budget Variance",
      score: budgetScore,
      trend: overBudget.length > 0 ? +overBudget.length * 4 : -2,
      status: budgetScore >= 60 ? "Watch" : "Stable",
      detail: `${overBudget.length} of ${budgets.length} departments over budget. Total variance: ${budgetVariancePct > 0 ? "+" + Math.round(budgetVariancePct * 100) + "%" : "on track"}.`,
    },
    {
      id: "market",
      label: "Market Signal",
      score: marketScore,
      trend: -2,
      status: "Stable",
      detail: "External market signals based on industry benchmarks. Add revenue streams for more accurate market analysis.",
    },
  ];
}

// ─── GET /api/financial/risk — FULL risk radar payload ────────────────────────
export const getRiskData = async (req, res) => {
  try {
    const data = await FinancialData.findOne({ userId: req.userId });
    if (!data) return res.json({ risk: null });

    const { metrics, company, transactions, budgets } = data;
    const cashBalance = company.cashBalance || 0;

    // Derived values
    const overBudget = budgets.filter(b => b.spent > b.allocated);
    const riskStatus = metrics.riskScore >= 70 ? "High"
                     : metrics.riskScore >= 40 ? "Medium" : "Low";

    // Build burn rate change % (compare first half vs second half of transactions)
    const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    const mid = Math.floor(sorted.length / 2);
    const firstHalfExpenses = sorted.slice(0, mid).filter(t => t.type === "Expense").reduce((s, t) => s + t.amount, 0);
    const secondHalfExpenses = sorted.slice(mid).filter(t => t.type === "Expense").reduce((s, t) => s + t.amount, 0);
    const burnRateChangePct = firstHalfExpenses > 0
      ? Math.round(((secondHalfExpenses - firstHalfExpenses) / firstHalfExpenses) * 100)
      : 0;

    // Trend data for chart (7D, 30D, 90D)
    const trendData = {
      "7D":  buildTrendData(transactions, metrics.runwayMonths, metrics.riskScore, metrics.netBurn, 7),
      "30D": buildTrendData(transactions, metrics.runwayMonths, metrics.riskScore, metrics.netBurn, 30),
      "90D": buildTrendData(transactions, metrics.runwayMonths, metrics.riskScore, metrics.netBurn, 90),
    };

    res.json({
      risk: {
        // Core metrics
        riskScore:    metrics.riskScore,
        riskStatus,
        runwayMonths: metrics.runwayMonths,
        netBurn:      metrics.netBurn,
        totalRevenue: metrics.totalRevenue,
        totalExpenses: metrics.totalExpenses,
        cashBalance,
        burnRateChangePct,
        burnRatePeriod: sorted.length > 1 ? "period" : "N/A",

        // Breakdown panels
        top_reasons:          buildTopReasons(metrics, budgets),
        alerts:               buildAlerts(metrics, budgets, transactions),
        drivers:              buildDrivers(metrics, budgets),
        recommended_actions:  buildRecommendedActions(metrics, budgets),
        signals_table:        buildSignalsTable(metrics, budgets, cashBalance),

        // Chart data
        trendData,

        // Meta
        budget_variance_departments: overBudget.length,
        last_updated: new Date().toISOString(),
        currency: company.currency || "USD",
        company_name: company.name || "",
      },
    });
  } catch (err) {
    console.error("[getRiskData]", err);
    res.status(500).json({ error: "Failed to compute risk data." });
  }
};
