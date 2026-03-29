// Internal keys for index sidebar
export const INDEX_SYMBOLS = ["DOW", "NASDAQ", "RUSSELL", "SP500"];

// Correct ETF proxies verified for Twelve Data
export const SYMBOL_MAPPING = {
  DOW: "DIA", // Dow Jones Industrial ETF
  NASDAQ: "QQQ", // NASDAQ-100 ETF
  RUSSELL: "IWM", // Russell 2000 ETF
  SP500: "SPY", // S&P 500 ETF
};

// Display names for sidebar
export const DISPLAY_NAMES = {
  DOW: "DOW JONES",
  NASDAQ: "NASDAQ 100",
  RUSSELL: "RUSSELL 2000",
  SP500: "S&P 500",
};

// Popular stocks shown in the top ticker strip
export const TICKER_SYMBOLS = [
  "AAPL", // Apple
  "MSFT", // Microsoft
  "NVDA", // NVIDIA
  "TSLA", // Tesla
  "AMZN", // Amazon
  "META", // Meta
  "GOOGL", // Alphabet (Must be GOOGL to match python backend)
  "AMD", // AMD
  "NFLX", // Netflix
  "JPM", // JPMorgan
];
