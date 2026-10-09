import axios from "axios";

const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";

export const getCompanyNews = async (symbol) => {
  try {
    const today = new Date();

    const from = new Date();
    from.setDate(today.getDate() - 7);

    const response = await axios.get(
      `${FINNHUB_BASE_URL}/company-news`,
      {
        params: {
          symbol,
          from: from.toISOString().split("T")[0],
          to: today.toISOString().split("T")[0],
          token: process.env.FINNHUB_API_KEY,
        },
      }
    );

    return response.data.slice(0, 10);
  } catch (error) {
    throw new Error("Failed to fetch company news");
  }
};