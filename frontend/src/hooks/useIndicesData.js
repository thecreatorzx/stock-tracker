import { useState, useEffect } from "react";
import api from "../api";
import { INDEX_SYMBOLS, SYMBOL_MAPPING, DISPLAY_NAMES } from "../constants";

export function useIndicesData() {
  const [indices, setIndices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIndices = async () => {
      try {
        const res = await api.get("/api/market/batch");
        const cache = res.data;

        const results = INDEX_SYMBOLS.map((symbol) => {
          const apiSymbol = SYMBOL_MAPPING[symbol];
          const data = cache[apiSymbol] || { price: 0, price_change: 0 };
          const pct = data.price_change ?? 0;

          return {
            symbol,
            name: DISPLAY_NAMES[symbol],
            price: data.price ? data.price.toFixed(2) : "—",
            change: Math.abs(pct).toFixed(2),
            isPositive: pct >= 0,
          };
        });

        setIndices(results);
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to fetch market data");
        setIndices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchIndices();

    // Auto-refresh the indices every 15 seconds too!
    const interval = setInterval(fetchIndices, 15000);
    return () => clearInterval(interval);
  }, []);

  return { indices, loading, error };
}
