import { getCompanyNews } from "../services/newsService.js";

export const fetchCompanyNews = async (req, res) => {
  try {
    const { symbol } = req.params;

    const news = await getCompanyNews(symbol);

    res.status(200).json({
      success: true,
      news,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};