// client/src/services/financialService.js
import api from "./api.js";

export const getFinancialData   = async ()       => (await api.get("/financial")).data.data;
export const getMetrics         = async ()       => (await api.get("/financial/metrics")).data;
export const getRiskData        = async ()       => (await api.get("/financial/risk")).data.risk;
export const saveOnboarding     = async (payload) => (await api.post("/financial/onboarding", payload)).data.data;
export const updateCompany      = async (company) => (await api.put("/financial/company", company)).data.data;
export const updateTransactions = async (transactions) => (await api.put("/financial/transactions", { transactions })).data.data;
export const updateBudgets      = async (budgets)      => (await api.put("/financial/budgets",      { budgets })).data.data;
export const updateRevenue      = async (revenue)      => (await api.put("/financial/revenue",      { revenue })).data.data;
