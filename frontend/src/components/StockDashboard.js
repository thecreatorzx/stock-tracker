import { useState, useEffect } from "react";
import api from "../api";
import IndicesSidebar from "./IndicesSidebar";
import StockChart from "./StockChart";

const pad = (n) => String(n).padStart(2, "0");
const formatTime = (d) =>
  `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
const formatDate = (d) =>
  `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

const StatBadge = ({ label, value, isPositive = null }) => {
  const colorClass =
    isPositive === null
      ? "text-[var(--accent)]"
      : isPositive
        ? "text-[var(--positive)]"
        : "text-[var(--negative)]";

  const bg =
    isPositive === null
      ? "var(--accent-bg)"
      : isPositive
        ? "var(--positive-bg)"
        : "var(--negative-bg)";

  const border =
    isPositive === null
      ? "var(--accent-border)"
      : isPositive
        ? "var(--positive-border)"
        : "var(--negative-border)";

  return (
    <div
      className="rounded-xl px-4 py-3"
      style={{ background: bg, border: `1px solid ${border}` }}
    >
      <p className="font-outfit text-[9px] font-bold tracking-widest uppercase text-[var(--text-muted)] mb-1">
        {label}
      </p>
      <p
        className={`font-mono text-[20px] font-bold tracking-tight leading-none ${colorClass}`}
      >
        {value}
      </p>
    </div>
  );
};

const Spinner = () => (
  <div className="flex justify-center items-center h-full">
    <div className="spinner" />
  </div>
);

const StockDashboard = ({ symbol }) => {
  const [stockData, setStockData] = useState(null);
  const [priceChange, setPriceChange] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Data Fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Hit the new smart backend endpoint
        const res = await api.get(`/api/quote/${symbol}`);
        const data = res.data;

        setStockData({
          symbol: data.symbol,
          price: data.price,
          source: data.source,
        });
        setPriceChange({ price_change: data.price_change });
        setErr(null);
      } catch (error) {
        setErr(
          error.response?.data?.message ||
            `Symbol ${symbol} not found or API limit reached.`,
        );
        setStockData(null);
        setPriceChange(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [symbol]);

  const isPositive = priceChange?.price_change >= 0;

  return (
    <div className="flex" style={{ height: "calc(100vh - 98px)" }}>
      <IndicesSidebar />

      <main className="flex-1 overflow-y-auto p-7">
        {loading ? (
          <Spinner />
        ) : err ? (
          <div
            className="rounded-xl px-6 py-5 max-w-md mx-auto mt-12 text-center"
            style={{
              background: "var(--negative-bg)",
              border: "1px solid var(--negative-border)",
            }}
          >
            <p className="font-outfit text-[13px] text-[var(--negative)]">
              {err}
            </p>
          </div>
        ) : stockData ? (
          <div className="fade-in">
            {/* Top row */}
            <div className="flex flex-wrap justify-between items-start gap-5 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="font-mono text-[30px] font-bold tracking-tight text-[var(--text-primary)] leading-none">
                    {stockData.symbol}
                  </h2>
                  <span
                    className="font-outfit text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-md text-[var(--text-muted)]"
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    EQUITY
                  </span>
                  <span
                    className="flex items-center gap-1 px-2 py-1 rounded-md"
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div className="live-dot" />
                    <span className="font-outfit text-[9px] font-bold tracking-widest uppercase text-[var(--positive)]">
                      LIVE
                    </span>
                  </span>
                </div>
                <p className="font-mono text-[11px] text-[var(--text-muted)] tracking-wider">
                  {formatDate(currentTime)} · {formatTime(currentTime)} UTC
                </p>
              </div>

              <div className="flex items-end gap-3 flex-wrap">
                <div>
                  <p className="font-outfit text-[9px] font-bold tracking-widest uppercase text-[var(--text-muted)] mb-1">
                    LAST PRICE
                  </p>
                  <p className="font-mono text-[42px] font-bold tracking-tight text-[var(--text-primary)] leading-none">
                    ${stockData.price.toFixed(2)}
                  </p>
                </div>

                {priceChange && (
                  <StatBadge
                    label="Change"
                    value={`${isPositive ? "+" : "−"}${Math.abs(priceChange.price_change).toFixed(2)}%`}
                    isPositive={isPositive}
                  />
                )}
              </div>
            </div>

            <div className="mb-5">
              <span
                className="font-outfit text-[10px] font-medium tracking-widest uppercase px-3 py-1 rounded-md text-[var(--text-muted)]"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                }}
              >
                Source: {stockData.source}
              </span>
            </div>

            {/* Chart */}
            <StockChart symbol={symbol} />
          </div>
        ) : (
          <div className="flex justify-center items-center h-full">
            <p className="font-outfit text-[14px] text-[var(--text-muted)]">
              No data available
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default StockDashboard;
