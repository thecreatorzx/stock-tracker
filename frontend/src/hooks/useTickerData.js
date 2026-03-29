import { useState, useEffect } from "react";
import api from "../api";
import { TICKER_SYMBOLS } from "../constants";

export function useTickerData() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTickers = async () => {
      try {
        // Just ONE lightning-fast call to your backend's memory cache
        const res = await api.get("/api/market/batch");
        const cache = res.data;

        // Build stock ticker items
        const stockItems = TICKER_SYMBOLS.map((symbol) => {
          const data = cache[symbol] || { price: 0, price_change: 0 };
          const pct = data.price_change ?? 0;

          return {
            symbol,
            name: symbol,
            price: data.price ? data.price.toFixed(2) : "—",
            change: Math.abs(pct).toFixed(2),
            isPositive: pct >= 0,
          };
        });

        setItems(stockItems);
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to fetch ticker data");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTickers();

    // Auto-refresh the frontend every 15 seconds!
    // Since it hits your backend memory, this costs 0 API credits.
    const interval = setInterval(fetchTickers, 15000);
    return () => clearInterval(interval);
  }, []);

  return { items, loading, error };
}
