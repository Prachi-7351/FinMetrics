import {
  getStockQuote,
  getCompanyProfile,
  getFinancialMetrics,
} from "../services/marketService.js";

export const fetchStockQuote = async (req, res) => {
  try {
    const { symbol } = req.params;

    const quote = await getStockQuote(symbol);

    res.status(200).json({
      success: true,
      data: quote,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const fetchCompanyDetails = async (req, res) => {
  try {
    const { symbol } = req.params;

    const [profile, metrics] = await Promise.all([
      getCompanyProfile(symbol),
      getFinancialMetrics(symbol),
    ]);

    res.status(200).json({
      success: true,
      profile,
      metrics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};