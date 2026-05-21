// client/src/services/aiService.js
import api from "./api.js";

// Get a plain-text AI insight (used by Dashboard)
export const getAIInsights = async (extraParams = {}) => {
  const { data } = await api.post("/ai/insights", extraParams);
  return data.insights;
};

// Get structured AI recommendations driven by real DB data
// Returns { recommendations: [...], snapshot: {...} }
export const getAIRecommendations = async (customPrompt = "") => {
  const { data } = await api.post("/ai/recommendations", { customPrompt });
  return data; // { recommendations, snapshot }
};

// Run stress test simulation
export const runStressTest = async ({ scenario, severity }) => {
  const { data } = await api.post("/ai/stress", { scenario, severity });
  return data; // { analysis, computed }
};
