export const calculateMetrics = (data) => {
  const burnRate = data.expenses - data.revenue;
  const runway = burnRate > 0 ? data.cash / burnRate : "Infinite";
  const profitMargin = ((data.revenue - data.expenses) / data.revenue) * 100;
  const debtRatio = data.debt / data.revenue;

  return {
    burnRate,
    runway,
    profitMargin,
    debtRatio,
  };
};
export const generateRecommendations = (metrics) => {
  const recommendations = [];

  if (metrics.runway !== "Infinite" && metrics.runway < 6) {
    recommendations.push({
      title: "Short Cash Runway",
      description:
        "Your company has less than 6 months of cash runway. Consider reducing expenses or planning fundraising.",
      priority: "high",
    });
  }

  if (metrics.profitMargin < 10) {
    recommendations.push({
      title: "Low Profit Margin",
      description:
        "Profit margin is below healthy levels. Review operational costs or increase pricing efficiency.",
      priority: "medium",
    });
  }

  if (metrics.debtRatio > 0.5) {
    recommendations.push({
      title: "High Debt Exposure",
      description:
        "Debt ratio is high compared to revenue. Consider refinancing or reducing liabilities.",
      priority: "high",
    });
  }

  if (metrics.burnRate > 20000) {
    recommendations.push({
      title: "High Burn Rate",
      description:
        "Monthly burn rate is significant. Evaluate discretionary spending and optimize costs.",
      priority: "medium",
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      title: "Financial Health Stable",
      description:
        "Your financial indicators look healthy. Maintain current financial discipline.",
      priority: "low",
    });
  }

  return recommendations;
};