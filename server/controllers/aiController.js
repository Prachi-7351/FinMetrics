import { GoogleGenerativeAI } from "@google/generative-ai";

import FinancialData from "../models/FinancialData.js";

import extractTicker from "../utils/extractTicker.js";

import {
  buildBusinessPrompt,
  buildMarketPrompt,
  buildComparisonPrompt,
  buildGeneralPrompt,
} from "../utils/promptBuilder.js";

import {
  getStockQuote,
  getCompanyProfile,
  getFinancialMetrics,
} from "../services/marketService.js";

import { getCompanyNews } from "../services/newsService.js";

let geminiModel = null;

function getGeminiModel() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not found in .env");
  }

  if (!geminiModel) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    geminiModel = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });
  }

  return geminiModel;
}

async function askGemini(prompt) {
  const model = getGeminiModel();

  const result = await model.generateContent(prompt);

  return result.response.text();
}

const fmt = (num) => Number(num || 0).toLocaleString();
const COMPANY_MAP = {
  apple: "AAPL",
  microsoft: "MSFT",
  tesla: "TSLA",
  nvidia: "NVDA",
  amazon: "AMZN",
  google: "GOOGL",
  meta: "META",
};

function detectIntent(prompt) {
  const p = prompt.toLowerCase();

  if (p.includes("compare")) {
    return "compare";
  }

  if (extractTicker(p)) {
    return "market";
  }

  const businessWords = [
    "expense",
    "expenses",
    "revenue",
    "cash",
    "budget",
    "profit",
    "burn",
    "runway",
    "startup",
    "business",
    "growth",
    "finance",
    "financial",
    "cost",
    "margin",
    "income",
    "loss",
  ];

  for (const word of businessWords) {
    if (p.includes(word)) {
      return "business";
    }
  }

  return "general";
}

function getCompaniesFromPrompt(prompt) {
  const p = prompt.toLowerCase();

  const companies = [];

  for (const company in COMPANY_MAP) {
    if (p.includes(company)) {
      companies.push({
        name: company,
        ticker: COMPANY_MAP[company],
      });
    }
  }

  return companies;
}

function buildFinancialSummary(finData) {
  if (!finData) {
    return "No financial data available.";
  }

  const metrics = finData.metrics || {};
  const company = finData.company || {};

  return `
Company Name: ${company.name || "Unknown"}

Revenue: $${fmt(metrics.totalRevenue)}

Expenses: $${fmt(metrics.totalExpenses)}

Cash Balance: $${fmt(company.cashBalance)}

Risk Score: ${metrics.riskScore || 0}/100

Runway: ${metrics.runwayMonths || "N/A"} months

Currency: ${company.currency || "USD"}

Goals:

${(finData.goals || []).join(", ") || "None"}
`;
}

// ======================================================
// AI CFO
// POST /api/ai/cfo
// ======================================================

export const aiCFO = async (req, res) => {

    try {

        const { prompt } = req.body;

        if (!prompt || prompt.trim() === "") {

            return res.status(400).json({

                success: false,

                message: "Prompt is required."

            });

        }

        const intent = detectIntent(prompt);

        const financialData = await FinancialData.findOne({

            userId: req.userId

        });

        //--------------------------------------------------
        // BUSINESS ANALYSIS
        //--------------------------------------------------

        if (intent === "business") {

            const businessPrompt = buildBusinessPrompt({

                userPrompt: prompt,

                financialData

            });

            const response = await askGemini(businessPrompt);

            return res.json({

                success: true,

                intent,

                response

            });

        }

        //--------------------------------------------------
        // MARKET ANALYSIS
        //--------------------------------------------------

        if (intent === "market") {

            const ticker = extractTicker(prompt);

            if (!ticker) {

                return res.status(400).json({

                    success: false,

                    message: "Unable to detect company."

                });

            }

            const quote = await getStockQuote(ticker);

            const profile = await getCompanyProfile(ticker);

            const metrics = await getFinancialMetrics(ticker);

            const news = await getCompanyNews(ticker);

            const marketPrompt = buildMarketPrompt({

                userPrompt: prompt,

                company: ticker,

                quote,

                profile,

                metrics,

                news

            });

            const response = await askGemini(marketPrompt);

            return res.json({

                success: true,

                intent,

                ticker,

                response,

                marketData: {

                    quote,

                    profile,

                    metrics,

                    news

                }

            });

        }

        //--------------------------------------------------
        // COMPANY COMPARISON
        //--------------------------------------------------

        if (intent === "compare") {

            const companies = getCompaniesFromPrompt(prompt);

            if (companies.length < 2) {

                return res.status(400).json({

                    success: false,

                    message: "Please specify two companies."

                });

            }

            const company1 = companies[0];

            const company2 = companies[1];

            const company1Data = {

                quote: await getStockQuote(company1.ticker),

                profile: await getCompanyProfile(company1.ticker),

                metrics: await getFinancialMetrics(company1.ticker)

            };

            const company2Data = {

                quote: await getStockQuote(company2.ticker),

                profile: await getCompanyProfile(company2.ticker),

                metrics: await getFinancialMetrics(company2.ticker)

            };

            const comparePrompt = buildComparisonPrompt({

                userPrompt: prompt,

                company1: company1.name,

                company2: company2.name,

                company1Data,

                company2Data

            });

            const response = await askGemini(comparePrompt);

            return res.json({

                success: true,

                intent,

                response,

                companies: [

                    company1,

                    company2

                ]

            });

        }

        //--------------------------------------------------
        // GENERAL FINANCE
        //--------------------------------------------------

        const generalPrompt = buildGeneralPrompt({

            userPrompt: prompt,

            financialData

        });

        const response = await askGemini(generalPrompt);

        return res.json({

            success: true,

            intent: "general",

            response

        });

    }

    catch (error) {

        console.error("AI CFO Error:", error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// ======================================================
// AI RECOMMENDATIONS
// POST /api/ai/recommendations
// ======================================================

export const getAIRecommendations = async (req, res) => {

    try {

        const financialData = await FinancialData.findOne({

            userId: req.userId

        });

        if (!financialData) {

            return res.status(404).json({

                success: false,

                message: "Financial data not found."

            });

        }

        const metrics = financialData.metrics || {};

        const company = financialData.company || {};

        const budgets = financialData.budgets || [];

        const transactions = financialData.transactions || [];

        const revenueStreams = financialData.revenueStreams || [];

        const goals = financialData.goals || [];

        const totalRevenue = metrics.totalRevenue || 0;

        const totalExpenses = metrics.totalExpenses || 0;

        const netBurn = metrics.netBurn || 0;

        const runwayMonths = metrics.runwayMonths || 0;

        const riskScore = metrics.riskScore || 0;

        const cashBalance = company.cashBalance || 0;

        const companyName = company.name || "Your Company";

        const currency = company.currency || "USD";

        //--------------------------------------------------
        // Budget Analysis
        //--------------------------------------------------

        const overBudget = budgets.filter(

            budget => budget.spent > budget.allocated

        );

        const overBudgetSummary = overBudget.map(b =>

            `${b.dept}: allocated ${fmt(b.allocated)}, spent ${fmt(b.spent)}`

        ).join("\n");

        //--------------------------------------------------
        // Expense Analysis
        //--------------------------------------------------

        const expenseTransactions = transactions.filter(

            t => t.type === "Expense"

        );

        const categoryTotals = {};

        expenseTransactions.forEach(t => {

            categoryTotals[t.category] =

                (categoryTotals[t.category] || 0) + t.amount;

        });

        const topExpenses = Object.entries(categoryTotals)

            .sort((a, b) => b[1] - a[1])

            .slice(0, 5)

            .map(([category, amount]) =>

                `${category}: ${fmt(amount)}`

            )

            .join("\n");

        //--------------------------------------------------
        // Revenue Streams
        //--------------------------------------------------

        const streamSummary = revenueStreams.map(stream =>

            `${stream.stream}: ${fmt(stream.amount)} (${stream.growth}% growth)`

        ).join("\n");

        //--------------------------------------------------
        // Calculations
        //--------------------------------------------------

        const profit = totalRevenue - totalExpenses;

        const profitMargin =

            totalRevenue > 0

                ? ((profit / totalRevenue) * 100).toFixed(2)

                : 0;

        const burnRate =

            netBurn > 0

                ? (netBurn / 12).toFixed(2)

                : 0;
                        //--------------------------------------------------
        // Build Gemini Prompt
        //--------------------------------------------------

        const prompt = `
You are an expert Chief Financial Officer (CFO).

Analyze the following business data and generate EXACTLY 4 actionable recommendations.

Company Name:
${companyName}

Currency:
${currency}

FINANCIAL SUMMARY

Revenue: ${fmt(totalRevenue)}

Expenses: ${fmt(totalExpenses)}

Profit: ${fmt(profit)}

Profit Margin: ${profitMargin}%

Cash Balance: ${fmt(cashBalance)}

Runway: ${runwayMonths} months

Risk Score: ${riskScore}/100

Monthly Burn Rate: ${burnRate}

Business Goals:

${goals.join(", ") || "None"}

Top Expense Categories:

${topExpenses || "No expense data"}

Budget Overruns:

${overBudgetSummary || "None"}

Revenue Streams:

${streamSummary || "No revenue streams"}

Return ONLY valid JSON.

No markdown.

No explanation.

The JSON format MUST be:

[
{
"id":1,
"priority":"critical",
"title":"Recommendation title",
"category":"Cost Optimization",
"short":"One sentence summary",
"desc":"Detailed explanation",
"impact":"Expected impact",
"confidence":92,
"effort":"Medium",
"metrics":[
{
"l":"Profit Margin",
"v":"18%",
"bad":false
}
],
"reasoning":"Why this recommendation matters."
}
]

Generate exactly FOUR recommendations.

Priority can only be:

critical

high

medium

low

Category can only be:

Cost Optimization

Revenue Growth

Risk Management

Cash Flow

Operations

Confidence must be between 60 and 99.
`;

        //--------------------------------------------------
        // Ask Gemini
        //--------------------------------------------------

        const rawResponse = await askGemini(prompt);

        //--------------------------------------------------
        // Parse JSON
        //--------------------------------------------------

        let recommendations;

        try {

            recommendations = JSON.parse(

                cleanJSON(rawResponse)

            );

        } catch (err) {

            console.log(rawResponse);

            return res.status(500).json({

                success: false,

                message: "Gemini returned invalid JSON."

            });

        }

        //--------------------------------------------------
        // Icons
        //--------------------------------------------------

        const icons = {

            "Cost Optimization":
                "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2",

            "Revenue Growth":
                "M13 7h8m0 0v8m0-8l-8 8",

            "Risk Management":
                "M12 9v2m0 4h.01",

            "Cash Flow":
                "M5 13l4 4L19 7",

            "Operations":
                "M9 5H7a2 2 0 00-2 2v12"
        };

        recommendations = recommendations.map((item, index) => ({

            id: item.id || index + 1,

            priority: item.priority,

            category: item.category,

            title: item.title,

            short: item.short,

            desc: item.desc,

            impact: item.impact,

            confidence: item.confidence,

            effort: item.effort,

            metrics: item.metrics || [],

            reasoning: item.reasoning,

            icon:

                icons[item.category] ||

                icons["Operations"]

        }));

        //--------------------------------------------------
        // Response
        //--------------------------------------------------

        return res.json({

            success: true,

            recommendations,

            snapshot: {

                companyName,

                currency,

                totalRevenue,

                totalExpenses,

                profit,

                profitMargin,

                cashBalance,

                runwayMonths,

                riskScore,

                burnRate

            }

        });

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// ======================================================
// AI INSIGHTS
// POST /api/ai/insights
// ======================================================

export const getAIInsights = async (req, res) => {

    try {

        const financialData = await FinancialData.findOne({

            userId: req.userId

        });

        if (!financialData) {

            return res.status(404).json({

                success: false,

                message: "Financial data not found."

            });

        }

        const metrics = financialData.metrics || {};

        const company = financialData.company || {};

        const transactions = financialData.transactions || [];

        const budgets = financialData.budgets || [];

        const goals = financialData.goals || [];

        const revenue = metrics.totalRevenue || 0;

        const expenses = metrics.totalExpenses || 0;

        const profit = revenue - expenses;

        const cash = company.cashBalance || 0;

        const runway = metrics.runwayMonths || 0;

        const risk = metrics.riskScore || 0;

        const prompt = `

You are an experienced Chief Financial Officer.

Prepare a professional Executive Financial Report.

Company:

${company.name || "Unknown Company"}

Financial Summary

Revenue: ${fmt(revenue)}

Expenses: ${fmt(expenses)}

Profit: ${fmt(profit)}

Cash Balance: ${fmt(cash)}

Runway: ${runway} months

Risk Score: ${risk}/100

Transactions:

${transactions.length}

Budgets:

${budgets.length}

Business Goals:

${goals.join(", ") || "None"}

Write the report in this format.

# Executive Summary

# Financial Health

# Risks

# Opportunities

# Immediate Priorities

# Long-term Strategy

Keep it professional.

Use bullet points where appropriate.

Do not use markdown tables.

`;

        const response = await askGemini(prompt);

        return res.json({

            success: true,

            insights: response

        });

    }

    catch(error){

        console.error(error);

        return res.status(500).json({

            success:false,

            message:error.message

        });

    }

};

// ======================================================
// AI STRESS TEST
// POST /api/ai/stress
// ======================================================

export const runStressTest = async (req, res) => {

    try {

        const {

            scenario = "Revenue Decline",

            severity = 20

        } = req.body;

        const financialData = await FinancialData.findOne({

            userId: req.userId

        });

        if (!financialData) {

            return res.status(404).json({

                success: false,

                message: "Financial data not found."

            });

        }

        const metrics = financialData.metrics || {};

        const company = financialData.company || {};

        const revenue = metrics.totalRevenue || 0;

        const expenses = metrics.totalExpenses || 0;

        const cash = company.cashBalance || 0;

        //----------------------------------------------------
        // Calculations
        //----------------------------------------------------

        const revenueLoss = revenue * (severity / 100);

        const stressedRevenue = revenue - revenueLoss;

        const monthlyBurn = Math.max(

            0,

            expenses - stressedRevenue

        );

        let stressedRunway;

        if (monthlyBurn === 0) {

            stressedRunway = "Cash Flow Positive";

        } else {

            stressedRunway = (

                cash / monthlyBurn

            ).toFixed(1);

        }

        //----------------------------------------------------
        // Prompt
        //----------------------------------------------------

        const prompt = `

You are an experienced Chief Financial Officer.

Run a financial stress test.

Scenario:

${scenario}

Revenue Reduction:

${severity}%

Original Revenue:

${fmt(revenue)}

Revenue After Stress:

${fmt(stressedRevenue)}

Expenses:

${fmt(expenses)}

Cash Balance:

${fmt(cash)}

Estimated Monthly Burn:

${fmt(monthlyBurn)}

Estimated Runway:

${stressedRunway}

Produce a professional report.

Use sections.

Executive Summary

Business Impact

Liquidity Analysis

Risk Assessment

Immediate Actions

Recovery Plan

Keep recommendations realistic and actionable.

`;

        const response = await askGemini(prompt);

        return res.json({

            success: true,

            analysis: response,

            computed: {

                scenario,

                severity,

                originalRevenue: revenue,

                stressedRevenue,

                revenueLoss,

                monthlyBurn,

                stressedRunway,

                cash

            }

        });

    }

    catch(error){

        console.error(error);

        return res.status(500).json({

            success:false,

            message:error.message

        });

    }

};






























// import { GoogleGenerativeAI } from "@google/generative-ai";

// import extractTicker from "../utils/extractTicker.js";

// import {
//     buildBusinessPrompt,
//     buildMarketPrompt,
//     buildComparisonPrompt,
//     buildGeneralPrompt,
// } from "../utils/promptBuilder.js";

// import {
//     getStockQuote,
//     getCompanyProfile,
//     getCompanyNews,
//     getFinancialMetrics,
// } from "../services/marketService.js";

// // ─── Lazy-initialize OpenAI client so missing key doesn't crash the server ───
// let model = null;

// function getGeminiModel() {

//     if (!process.env.GEMINI_API_KEY) {
//         return null;
//     }

//     if (!model) {

//         const genAI = new GoogleGenerativeAI(
//             process.env.GEMINI_API_KEY
//         );

//         model = genAI.getGenerativeModel({
//             model: "gemini-2.5-flash"
//         });

//     }

//     return model;

// }

// // ─── helpers ────────────────────────────────────────────────────────────────
// const fmt = (n) => Number(n || 0).toLocaleString();

// // ─── POST /api/ai/insights  (protected) ─────────────────────────────────────
// export const getAIInsights = async (req, res) => {
//   const client = getClient();
//   if (!client) return res.status(503).json({ error: "OpenAI API key not configured." });

//   try {
//     const finData = await FinancialData.findOne({ userId: req.userId });

//     let revenue, expenses, cash, debt, company, goals;
//     if (finData) {
//       revenue  = finData.metrics.totalRevenue;
//       expenses = finData.metrics.totalExpenses;
//       cash     = finData.company.cashBalance;
//       debt     = req.body.debt || 0;
//       company  = finData.company.name || "Your Company";
//       goals    = (finData.goals || []).join(", ");
//     } else {
//       ({ revenue, expenses, cash, debt } = req.body);
//       company = "Your Company";
//       goals   = "";
//     }

//     const prompt = `
// You are an expert CFO AI advising ${company}.

// Financial metrics:
// - Monthly Revenue: $${fmt(revenue)}
// - Monthly Expenses: $${fmt(expenses)}
// - Cash Reserve: $${fmt(cash)}
// - Debt: $${fmt(debt)}
// - Net Burn Rate: $${fmt(Math.max(0, (expenses || 0) - (revenue || 0)))}/mo
// ${goals ? `- Business Goals: ${goals}` : ""}

// Provide structured advice:
// 1. **Key Financial Risk** — what is most urgent
// 2. **Cost Optimization** — specific actionable suggestion
// 3. **Growth Strategy** — how to improve revenue
// 4. **Financial Stability Assessment** — overall health summary

// Keep each point concise (2-3 sentences). Use $ amounts where relevant.
// `;

//     const completion = await client.chat.completions.create({
//       model: "gpt-4.1-mini",
//       messages: [
//         { role: "system", content: "You are a highly experienced CFO and financial strategist providing actionable, data-driven advice." },
//         { role: "user",   content: prompt },
//       ],
//       max_tokens: 700,
//     });

//     res.json({ insights: completion.choices[0].message.content });
//   } catch (error) {
//     console.error("[getAIInsights]", error);
//     res.status(500).json({ error: "AI insight generation failed." });
//   }
// };

// // ─── POST /api/ai/recommendations  (protected) ──────────────────────────────
// export const getAIRecommendations = async (req, res) => {
//   const client = getClient();
//   if (!client) return res.status(503).json({ error: "OpenAI API key not configured." });

//   try {
//     const finData = await FinancialData.findOne({ userId: req.userId });

//     const metrics       = finData?.metrics       || {};
//     const company       = finData?.company       || {};
//     const transactions  = finData?.transactions  || [];
//     const budgets       = finData?.budgets        || [];
//     const revenueStreams = finData?.revenueStreams || [];
//     const goals         = finData?.goals          || [];

//     const totalRevenue  = metrics.totalRevenue  || 0;
//     const totalExpenses = metrics.totalExpenses || 0;
//     const netBurn       = metrics.netBurn       || 0;
//     const runwayMonths  = metrics.runwayMonths  || 0;
//     const riskScore     = metrics.riskScore     || 0;
//     const cashBalance   = company.cashBalance   || 0;
//     const companyName   = company.name          || "Your Company";
//     const currency      = company.currency      || "USD";

//     const overBudget = budgets.filter(b => b.spent > b.allocated);
//     const overBudgetText = overBudget.map(b => `${b.dept} (+${fmt(b.spent - b.allocated)} over)`).join(", ");

//     const expTx = transactions.filter(t => t.type === "Expense");
//     const catMap = {};
//     expTx.forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + t.amount; });
//     const topExpenses = Object.entries(catMap)
//       .sort((a, b) => b[1] - a[1])
//       .slice(0, 3)
//       .map(([cat, amt]) => `${cat}: $${fmt(amt)}`)
//       .join(", ");

//     const streamsText = revenueStreams
//       .map(r => `${r.stream}: $${fmt(r.amount)} (${r.growth >= 0 ? "+" : ""}${r.growth}%)`)
//       .join(", ");

//     const customPrompt = req.body.customPrompt || "";
//     const profitMargin = totalRevenue > 0
//       ? (((totalRevenue - totalExpenses) / totalRevenue) * 100).toFixed(1)
//       : "0.0";
//     const burnRate = netBurn > 0 ? `$${fmt(Math.round(netBurn / 12))}/mo` : "cash-flow positive";

//     const systemPrompt = `You are an expert AI CFO analyzing real financial data. 
// Always respond with a valid JSON array — no markdown, no code fences, no preamble.
// Each element must follow this exact schema:
// {
//   "id": number,
//   "priority": "critical" | "high" | "medium" | "low",
//   "tag": string (short 1-2 word topic label),
//   "title": string (specific, actionable recommendation title),
//   "short": string (1 sentence summary under 15 words),
//   "desc": string (2-3 sentences detailed explanation with specific numbers from the data),
//   "impact": string (quantified expected outcome, e.g. "+2.1 mo" or "-18% CAC" or "$12K saved"),
//   "confidence": number (50-98, integer),
//   "effort": "Low" | "Medium" | "High",
//   "category": "Cost Optimization" | "Capital Strategy" | "Revenue Efficiency" | "Risk Mitigation" | "Operations",
//   "metrics": [{ "l": string, "v": string, "bad": boolean }],
//   "reasoning": string (2-3 sentence AI explanation of why this matters based on the data)
// }
// Return exactly 4 recommendations ordered from most to least urgent.`;

//     const userPrompt = `
// Analyze the following real financial data for ${companyName} and generate 4 actionable, data-specific recommendations.

// FINANCIAL SNAPSHOT:
// - Total Revenue: $${fmt(totalRevenue)} (${currency})
// - Total Expenses: $${fmt(totalExpenses)}
// - Net Burn Rate: ${burnRate}
// - Cash Balance: $${fmt(cashBalance)}
// - Runway: ${runwayMonths > 0 ? `${runwayMonths} months` : "N/A (cash flow positive)"}
// - Profit Margin: ${profitMargin}%
// - Overall Risk Score: ${riskScore}/100

// TOP EXPENSE CATEGORIES: ${topExpenses || "No transaction data"}
// BUDGET OVERRUNS: ${overBudgetText || "None"}
// REVENUE STREAMS: ${streamsText || "No stream data"}
// BUSINESS GOALS: ${goals.join(", ") || "Not specified"}
// ${customPrompt ? `\nADDITIONAL CONTEXT: ${customPrompt}` : ""}

// Return ONLY a valid JSON array of 4 recommendations. No markdown. No code fences. Raw JSON only.
// `;

//     const completion = await client.chat.completions.create({
//       model: "gpt-4.1-mini",
//       messages: [
//         { role: "system", content: systemPrompt },
//         { role: "user",   content: userPrompt },
//       ],
//       max_tokens: 2000,
//       temperature: 0.4,
//     });

//     let recs;
//     try {
//       const raw = completion.choices[0].message.content
//         .replace(/```json/g, "")
//         .replace(/```/g, "")
//         .trim();
//       recs = JSON.parse(raw);
//     } catch {
//       return res.status(500).json({ error: "AI returned malformed JSON. Please try again." });
//     }

//     const iconMap = {
//       "Cost Optimization": "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
//       "Capital Strategy":  "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
//       "Revenue Efficiency":"M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
//       "Risk Mitigation":   "M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
//       "Operations":        "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
//     };
//     recs = recs.map((r, i) => ({
//       ...r,
//       id: r.id || i + 1,
//       icon: iconMap[r.category] || iconMap["Operations"],
//     }));

//     res.json({
//       recommendations: recs,
//       snapshot: {
//         totalRevenue, totalExpenses, netBurn, runwayMonths,
//         riskScore, cashBalance,
//         profitMargin: parseFloat(profitMargin),
//         companyName, currency, burnRate,
//         budgetOverruns: overBudget.length,
//       },
//     });
//   } catch (error) {
//     console.error("[getAIRecommendations]", error);
//     res.status(500).json({ error: "AI recommendation generation failed." });
//   }
// };

// // ─── POST /api/ai/stress  (protected) ───────────────────────────────────────
// export const runStressTest = async (req, res) => {
//   const client = getClient();
//   if (!client) return res.status(503).json({ error: "OpenAI API key not configured." });

//   try {
//     const { scenario, severity } = req.body;
//     const finData = await FinancialData.findOne({ userId: req.userId });

//     const revenue  = finData?.metrics.totalRevenue  || 50000;
//     const expenses = finData?.metrics.totalExpenses || 40000;
//     const cash     = finData?.company.cashBalance   || 100000;

//     const revenueImpact   = (revenue * severity) / 100;
//     const stressedRevenue = revenue - revenueImpact;
//     const stressedBurn    = Math.max(0, expenses - stressedRevenue);
//     const stressedRunway  = stressedBurn > 0
//       ? parseFloat((cash / stressedBurn).toFixed(1))
//       : 999;

//     const prompt = `
// You are a CFO AI running a stress test for a company.

// Scenario: ${scenario} with ${severity}% revenue reduction.
// Original Revenue: $${fmt(revenue)}
// Stressed Revenue: $${fmt(stressedRevenue)} (↓${severity}%)
// Monthly Expenses: $${fmt(expenses)}
// Cash Reserve: $${fmt(cash)}
// Stressed Runway: ${stressedRunway} months

// Provide a brief 3-point stress test summary:
// 1. **Impact Assessment** — what this scenario means
// 2. **Survival Outlook** — can the company survive and for how long
// 3. **Recommended Actions** — top 2 things to do now

// Keep it concise and actionable.
// `;

//     const completion = await client.chat.completions.create({
//       model: "gpt-4.1-mini",
//       messages: [
//         { role: "system", content: "You are a CFO stress-testing financial scenarios." },
//         { role: "user",   content: prompt },
//       ],
//       max_tokens: 500,
//     });

//     res.json({
//       analysis: completion.choices[0].message.content,
//       computed: {
//         originalRevenue: revenue,
//         stressedRevenue,
//         revenueImpact,
//         stressedBurn,
//         stressedRunway,
//         severity,
//         scenario,
//       },
//     });
//   } catch (error) {
//     console.error("[runStressTest]", error);
//     res.status(500).json({ error: "Stress test failed." });
//   }
// };

// async function askGemini(prompt){

//     const model=getGeminiModel();

//     if(!model){

//         throw new Error("Gemini API Key missing.");

//     }

//     const result=await model.generateContent(prompt);

//     return result.response.text();

// }

// function detectIntent(prompt){

//     const p=prompt.toLowerCase();

//     if(p.includes("compare"))
//         return "compare";

//     if(extractTicker(p))
//         return "market";

//     if(

//         p.includes("expense") ||

//         p.includes("revenue") ||

//         p.includes("cash") ||

//         p.includes("budget") ||

//         p.includes("burn") ||

//         p.includes("profit") ||

//         p.includes("runway")

//     )
//         return "business";

//     return "general";

// }



// export const aiCFO = async(req,res)=>{

// try{

// const {prompt}=req.body;

// if(!prompt){

// return res.status(400).json({

// success:false,

// message:"Prompt is required."

// });

// }

// const intent=detectIntent(prompt);

// const financialData=await FinancialData.findOne({

// userId:req.userId

// });



// if(intent==="business"){

// const finalPrompt=buildBusinessPrompt({

// userPrompt:prompt,

// financialData

// });

// const response=await askGemini(finalPrompt);

// return res.json({

// success:true,

// intent,

// response

// });

// }



// if(intent==="market"){

// const ticker=extractTicker(prompt);

// if(!ticker){

// return res.status(400).json({

// success:false,

// message:"Company not found."

// });

// }

// const quote=await getStockQuote(ticker);

// const profile=await getCompanyProfile(ticker);

// const metrics=await getFinancialMetrics(ticker);

// const news=await getCompanyNews(ticker);

// const finalPrompt=buildMarketPrompt({

// userPrompt:prompt,

// company:ticker,

// quote,

// profile,

// metrics,

// news

// });

// const response=await askGemini(finalPrompt);

// return res.json({

// success:true,

// intent,

// ticker,

// response,

// marketData:{

// quote,

// profile,

// metrics,

// news

// }

// });

// }



// if(intent==="compare"){

// const words=prompt.toLowerCase();

// const companies=[];

// const map={

// apple:"AAPL",

// microsoft:"MSFT",

// tesla:"TSLA",

// nvidia:"NVDA",

// amazon:"AMZN",

// google:"GOOGL",

// meta:"META"

// };

// for(const key in map){

// if(words.includes(key))

// companies.push({

// name:key,

// ticker:map[key]

// });

// }

// if(companies.length<2){

// return res.status(400).json({

// success:false,

// message:"Please specify two companies."

// });

// }

// const c1=companies[0];

// const c2=companies[1];

// const company1Data={

// quote:await getStockQuote(c1.ticker),

// profile:await getCompanyProfile(c1.ticker),

// metrics:await getFinancialMetrics(c1.ticker)

// };

// const company2Data={

// quote:await getStockQuote(c2.ticker),

// profile:await getCompanyProfile(c2.ticker),

// metrics:await getFinancialMetrics(c2.ticker)

// };

// const finalPrompt=buildComparisonPrompt({

// userPrompt:prompt,

// company1:c1.name,

// company2:c2.name,

// company1Data,

// company2Data

// });

// const response=await askGemini(finalPrompt);

// return res.json({

// success:true,

// intent,

// response

// });

// }



// const finalPrompt=buildGeneralPrompt({

// userPrompt:prompt,

// financialData

// });

// const response=await askGemini(finalPrompt);

// return res.json({

// success:true,

// intent,

// response

// });

// }

// catch(error){

// console.error(error);

// return res.status(500).json({

// success:false,

// message:error.message

// });

// }

// };