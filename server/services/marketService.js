import axios from "axios";

const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";

export const getStockQuote = async (symbol) => {
  try {
    const response = await axios.get(
      `${FINNHUB_BASE_URL}/quote`,
      {
        params: {
          symbol,
          token: process.env.FINNHUB_API_KEY,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch stock quote");
  }
};

export const getCompanyProfile = async (symbol) => {
  try {
    const response = await axios.get(
      `${FINNHUB_BASE_URL}/stock/profile2`,
      {
        params: {
          symbol,
          token: process.env.FINNHUB_API_KEY,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch company profile");
  }
};

export const getFinancialMetrics = async (symbol) => {
  try {
    const response = await axios.get(
      `${FINNHUB_BASE_URL}/stock/metric`,
      {
        params: {
          symbol,
          metric: "all",
          token: process.env.FINNHUB_API_KEY,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch financial metrics");
  }
};