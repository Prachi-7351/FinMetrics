import OpenAI from "openai";
import FinancialData from "../models/FinancialData.js";

// ─── Lazy-initialize OpenAI client so missing key doesn't crash the server ───
let _client = null;
function getClient() {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your_openai_api_key_here") {
    return null;
  }
  if (!_client) _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _client;
}

// ─── helpers ────────────────────────────────────────────────────────────────
const fmt = (n) => Number(n || 0).toLocaleString();

// ─── POST /api/ai/insights  (protected) ─────────────────────────────────────
export const getAIInsights = async (req, res) => {
  const client = getClient();
  if (!client) return res.status(503).json({ error: "OpenAI API key not configured." });

  try {
    const finData = await FinancialData.findOne({ userId: req.userId });

    let revenue, expenses, cash, debt, company, goals;
    if (finData) {
      revenue  = finData.metrics.totalRevenue;
      expenses = finData.metrics.totalExpenses;
      cash     = finData.company.cashBalance;
      debt     = req.body.debt || 0;
      company  = finData.company.name || "Your Company";
      goals    = (finData.goals || []).join(", ");
    } else {
      ({ revenue, expenses, cash, debt } = req.body);
      company = "Your Company";
      goals   = "";
    }

    const prompt = `
You are an expert CFO AI advising ${company}.

Financial metrics:
- Monthly Revenue: $${fmt(revenue)}
- Monthly Expenses: $${fmt(expenses)}
- Cash Reserve: $${fmt(cash)}
- Debt: $${fmt(debt)}
- Net Burn Rate: $${fmt(Math.max(0, (expenses || 0) - (revenue || 0)))}/mo
${goals ? `- Business Goals: ${goals}` : ""}

Provide structured advice:
1. **Key Financial Risk** — what is most urgent
2. **Cost Optimization** — specific actionable suggestion
3. **Growth Strategy** — how to improve revenue
4. **Financial Stability Assessment** — overall health summary

Keep each point concise (2-3 sentences). Use $ amounts where relevant.
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: "You are a highly experienced CFO and financial strategist providing actionable, data-driven advice." },
        { role: "user",   content: prompt },
      ],
      max_tokens: 700,
    });

    res.json({ insights: completion.choices[0].message.content });
  } catch (error) {
    console.error("[getAIInsights]", error);
    res.status(500).json({ error: "AI insight generation failed." });
  }
};

// ─── POST /api/ai/recommendations  (protected) ──────────────────────────────
export const getAIRecommendations = async (req, res) => {
  const client = getClient();
  if (!client) return res.status(503).json({ error: "OpenAI API key not configured." });

  try {
    const finData = await FinancialData.findOne({ userId: req.userId });

    const metrics       = finData?.metrics       || {};
    const company       = finData?.company       || {};
    const transactions  = finData?.transactions  || [];
    const budgets       = finData?.budgets        || [];
    const revenueStreams = finData?.revenueStreams || [];
    const goals         = finData?.goals          || [];

    const totalRevenue  = metrics.totalRevenue  || 0;
    const totalExpenses = metrics.totalExpenses || 0;
    const netBurn       = metrics.netBurn       || 0;
    const runwayMonths  = metrics.runwayMonths  || 0;
    const riskScore     = metrics.riskScore     || 0;
    const cashBalance   = company.cashBalance   || 0;
    const companyName   = company.name          || "Your Company";
    const currency      = company.currency      || "USD";

    const overBudget = budgets.filter(b => b.spent > b.allocated);
    const overBudgetText = overBudget.map(b => `${b.dept} (+${fmt(b.spent - b.allocated)} over)`).join(", ");

    const expTx = transactions.filter(t => t.type === "Expense");
    const catMap = {};
    expTx.forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + t.amount; });
    const topExpenses = Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat, amt]) => `${cat}: $${fmt(amt)}`)
      .join(", ");

    const streamsText = revenueStreams
      .map(r => `${r.stream}: $${fmt(r.amount)} (${r.growth >= 0 ? "+" : ""}${r.growth}%)`)
      .join(", ");

    const customPrompt = req.body.customPrompt || "";
    const profitMargin = totalRevenue > 0
      ? (((totalRevenue - totalExpenses) / totalRevenue) * 100).toFixed(1)
      : "0.0";
    const burnRate = netBurn > 0 ? `$${fmt(Math.round(netBurn / 12))}/mo` : "cash-flow positive";

    const systemPrompt = `You are an expert AI CFO analyzing real financial data. 
Always respond with a valid JSON array — no markdown, no code fences, no preamble.
Each element must follow this exact schema:
{
  "id": number,
  "priority": "critical" | "high" | "medium" | "low",
  "tag": string (short 1-2 word topic label),
  "title": string (specific, actionable recommendation title),
  "short": string (1 sentence summary under 15 words),
  "desc": string (2-3 sentences detailed explanation with specific numbers from the data),
  "impact": string (quantified expected outcome, e.g. "+2.1 mo" or "-18% CAC" or "$12K saved"),
  "confidence": number (50-98, integer),
  "effort": "Low" | "Medium" | "High",
  "category": "Cost Optimization" | "Capital Strategy" | "Revenue Efficiency" | "Risk Mitigation" | "Operations",
  "metrics": [{ "l": string, "v": string, "bad": boolean }],
  "reasoning": string (2-3 sentence AI explanation of why this matters based on the data)
}
Return exactly 4 recommendations ordered from most to least urgent.`;

    const userPrompt = `
Analyze the following real financial data for ${companyName} and generate 4 actionable, data-specific recommendations.

FINANCIAL SNAPSHOT:
- Total Revenue: $${fmt(totalRevenue)} (${currency})
- Total Expenses: $${fmt(totalExpenses)}
- Net Burn Rate: ${burnRate}
- Cash Balance: $${fmt(cashBalance)}
- Runway: ${runwayMonths > 0 ? `${runwayMonths} months` : "N/A (cash flow positive)"}
- Profit Margin: ${profitMargin}%
- Overall Risk Score: ${riskScore}/100

TOP EXPENSE CATEGORIES: ${topExpenses || "No transaction data"}
BUDGET OVERRUNS: ${overBudgetText || "None"}
REVENUE STREAMS: ${streamsText || "No stream data"}
BUSINESS GOALS: ${goals.join(", ") || "Not specified"}
${customPrompt ? `\nADDITIONAL CONTEXT: ${customPrompt}` : ""}

Return ONLY a valid JSON array of 4 recommendations. No markdown. No code fences. Raw JSON only.
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userPrompt },
      ],
      max_tokens: 2000,
      temperature: 0.4,
    });

    let recs;
    try {
      const raw = completion.choices[0].message.content
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      recs = JSON.parse(raw);
    } catch {
      return res.status(500).json({ error: "AI returned malformed JSON. Please try again." });
    }

    const iconMap = {
      "Cost Optimization": "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      "Capital Strategy":  "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
      "Revenue Efficiency":"M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
      "Risk Mitigation":   "M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      "Operations":        "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    };
    recs = recs.map((r, i) => ({
      ...r,
      id: r.id || i + 1,
      icon: iconMap[r.category] || iconMap["Operations"],
    }));

    res.json({
      recommendations: recs,
      snapshot: {
        totalRevenue, totalExpenses, netBurn, runwayMonths,
        riskScore, cashBalance,
        profitMargin: parseFloat(profitMargin),
        companyName, currency, burnRate,
        budgetOverruns: overBudget.length,
      },
    });
  } catch (error) {
    console.error("[getAIRecommendations]", error);
    res.status(500).json({ error: "AI recommendation generation failed." });
  }
};

// ─── POST /api/ai/stress  (protected) ───────────────────────────────────────
export const runStressTest = async (req, res) => {
  const client = getClient();
  if (!client) return res.status(503).json({ error: "OpenAI API key not configured." });

  try {
    const { scenario, severity } = req.body;
    const finData = await FinancialData.findOne({ userId: req.userId });

    const revenue  = finData?.metrics.totalRevenue  || 50000;
    const expenses = finData?.metrics.totalExpenses || 40000;
    const cash     = finData?.company.cashBalance   || 100000;

    const revenueImpact   = (revenue * severity) / 100;
    const stressedRevenue = revenue - revenueImpact;
    const stressedBurn    = Math.max(0, expenses - stressedRevenue);
    const stressedRunway  = stressedBurn > 0
      ? parseFloat((cash / stressedBurn).toFixed(1))
      : 999;

    const prompt = `
You are a CFO AI running a stress test for a company.

Scenario: ${scenario} with ${severity}% revenue reduction.
Original Revenue: $${fmt(revenue)}
Stressed Revenue: $${fmt(stressedRevenue)} (↓${severity}%)
Monthly Expenses: $${fmt(expenses)}
Cash Reserve: $${fmt(cash)}
Stressed Runway: ${stressedRunway} months

Provide a brief 3-point stress test summary:
1. **Impact Assessment** — what this scenario means
2. **Survival Outlook** — can the company survive and for how long
3. **Recommended Actions** — top 2 things to do now

Keep it concise and actionable.
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: "You are a CFO stress-testing financial scenarios." },
        { role: "user",   content: prompt },
      ],
      max_tokens: 500,
    });

    res.json({
      analysis: completion.choices[0].message.content,
      computed: {
        originalRevenue: revenue,
        stressedRevenue,
        revenueImpact,
        stressedBurn,
        stressedRunway,
        severity,
        scenario,
      },
    });
  } catch (error) {
    console.error("[runStressTest]", error);
    res.status(500).json({ error: "Stress test failed." });
  }
};
