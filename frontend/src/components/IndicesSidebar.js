import React, { useState } from "react";
import { useIndicesData } from "../hooks/useIndicesData";

const SkeletonCard = () => (
  <div
    className="rounded-xl p-4"
    style={{
      background: "var(--bg-elevated)",
      border: "1px solid var(--border)",
    }}
  >
    <div className="flex justify-between items-center mb-3">
      <div className="skeleton h-[9px] w-[70px]" />
      <div className="skeleton h-[18px] w-[50px] rounded-md" />
    </div>
    <div className="skeleton h-[22px] w-[90px]" />
  </div>
);

const IndexCard = ({ index }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="rounded-xl p-4 cursor-pointer transition-all duration-150"
      style={{
        background: hovered ? "var(--bg-hover)" : "var(--bg-elevated)",
        border: `1px solid ${hovered ? "var(--border-light)" : "var(--border)"}`,
      }}
    >
      {/* Top row */}
      <div className="flex justify-between items-center mb-2">
        <span className="font-outfit text-[10px] font-semibold tracking-widest uppercase text-[var(--text-muted)]">
          {index.name}
        </span>
        <span
          className="font-mono text-[10px] px-2 py-[2px] rounded-md"
          style={{
            background: index.isPositive
              ? "var(--positive-bg)"
              : "var(--negative-bg)",
            border: `1px solid ${index.isPositive ? "var(--positive-border)" : "var(--negative-border)"}`,
            color: index.isPositive ? "var(--positive)" : "var(--negative)",
          }}
        >
          {index.isPositive ? "+" : "−"}
          {index.change}%
        </span>
      </div>

      {/* Price */}
      <p className="font-mono text-[20px] font-bold tracking-tight text-[var(--text-primary)]">
        ${index.price}
      </p>
    </div>
  );
};

function IndicesSidebar() {
  const { indices, loading, error } = useIndicesData();

  return (
    <aside
      className="hidden lg:flex flex-col h-full"
      style={{
        width: "230px",
        minWidth: "230px",
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center px-4 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <span className="font-outfit text-[11px] font-bold tracking-widest uppercase text-[var(--text-muted)]">
          Global Market
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {loading ? (
          [1, 2, 3].map((i) => <SkeletonCard key={i} />)
        ) : error ? (
          <p className="text-[var(--negative)] text-[12px] p-2">{error}</p>
        ) : (
          indices.map((index) => <IndexCard key={index.symbol} index={index} />)
        )}
      </div>

      {/* Footer */}
      <div
        className="flex items-center gap-2 px-4 py-3 flex-shrink-0"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div className="live-dot" />
        <span className="font-outfit text-[10px] font-bold tracking-widest uppercase text-[var(--text-muted)]">
          Live Data
        </span>
      </div>
    </aside>
  );
}

export default IndicesSidebar;
