import React from "react";
import { useTickerData } from "../hooks/useTickerData";

const TickerItem = ({ item }) => (
  <div className="flex items-center gap-3 px-7">
    <span className="font-outfit text-[10px] font-semibold text-[var(--text-muted)] tracking-widest uppercase">
      {item.name}
    </span>
    <span className="font-mono text-[12px] text-[var(--text-primary)]">
      ${item.price}
    </span>
    <span
      className={`font-mono text-[11px] ${
        item.isPositive ? "text-[var(--positive)]" : "text-[var(--negative)]"
      }`}
    >
      {item.isPositive ? "▲" : "▼"} {item.change}%
    </span>
    <span className="text-[var(--border-light)] text-sm ml-1">|</span>
  </div>
);

const TopStrip = () => {
  const { items, loading, error } = useTickerData();

  return (
    <div
      className="flex items-center overflow-hidden"
      style={{
        background: "var(--bg-surface)",
        borderBottom: "1px solid var(--border)",
        height: "38px",
      }}
    >
      {/* Static label */}
      <div
        className="flex items-center gap-2 h-full px-4 flex-shrink-0"
        style={{
          background: "var(--bg-elevated)",
          borderRight: "1px solid var(--border)",
        }}
      >
        <div className="live-dot" />
        <span className="font-outfit text-[10px] font-bold text-[var(--text-muted)] tracking-widest uppercase">
          Markets
        </span>
      </div>

      {/* Ticker */}
      <div className="flex-1 overflow-hidden h-full flex items-center">
        {loading ? (
          <div className="flex gap-6 px-6">
            {[100, 80, 90, 110, 85, 95].map((w, i) => (
              <div key={i} className="skeleton h-[10px]" style={{ width: w }} />
            ))}
          </div>
        ) : error ? (
          <p className="text-[var(--negative)] text-[11px] px-4">{error}</p>
        ) : (
          // Triplicate so loop is never visible
          <div className="ticker-track">
            {[...items, ...items, ...items].map((item, i) => (
              <TickerItem key={`${item.symbol}-${i}`} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopStrip;
