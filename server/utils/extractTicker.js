// server/utils/extractTicker.js

const companyMap = {
  // Technology
  apple: "AAPL",
  aapl: "AAPL",

  microsoft: "MSFT",
  msft: "MSFT",

  tesla: "TSLA",
  tsla: "TSLA",

  nvidia: "NVDA",
  nvda: "NVDA",

  amazon: "AMZN",
  amzn: "AMZN",

  google: "GOOGL",
  alphabet: "GOOGL",
  googl: "GOOGL",

  meta: "META",
  facebook: "META",

  netflix: "NFLX",
  nflx: "NFLX",

  amd: "AMD",

  intel: "INTC",
  intc: "INTC",

  oracle: "ORCL",
  orcl: "ORCL",

  adobe: "ADBE",
  adbe: "ADBE",

  salesforce: "CRM",
  crm: "CRM",

  uber: "UBER",

  airbnb: "ABNB",

  paypal: "PYPL",

  // EV
  rivian: "RIVN",
  lucid: "LCID",

  // Finance
  visa: "V",
  mastercard: "MA",
  jpmorgan: "JPM",
  goldman: "GS",
  morgan: "MS",

  // Retail
  walmart: "WMT",
  costco: "COST",
  target: "TGT",

  // Pharma
  pfizer: "PFE",
  moderna: "MRNA",
  eli: "LLY",
  lilly: "LLY",

  // Semiconductor
  broadcom: "AVGO",
  qualcomm: "QCOM",
  tsmc: "TSM",
  micron: "MU",

  // Entertainment
  disney: "DIS",

  // Misc
  coca: "KO",
  pepsi: "PEP",
  nike: "NKE",
  boeing: "BA",
  ford: "F",
  gm: "GM",

  // Indian Companies
  reliance: "RELIANCE.NS",
  tcs: "TCS.NS",
  infosys: "INFY.NS",
  hdfc: "HDFCBANK.NS",
  icici: "ICICIBANK.NS",
  wipro: "WIPRO.NS",
  sbi: "SBIN.NS",
  adani: "ADANIENT.NS",
  tata: "TATAMOTORS.NS"
};

export default function extractTicker(text) {
  if (!text) return null;

  text = text.toLowerCase();

  for (const company in companyMap) {
    if (text.includes(company)) {
      return companyMap[company];
    }
  }

  return null;
}