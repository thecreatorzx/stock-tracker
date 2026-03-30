import { useState } from "react";
import StockDashboard from "./components/StockDashboard";
import TopStrip from "./components/TopStrip";
import "./App.css";

const App = () => {
  const [symbol, setSymbol] = useState("AAPL");
  const [inputValue, setInputValue] = useState("AAPL");
  const [focused, setFocused] = useState(false);

  // Trigger search ONLY when Enter is pressed
  const handleSearch = (e) => {
    if (e.key === "Enter") {
      const val = inputValue.trim().toUpperCase();
      if (val && /^[A-Z]+$/.test(val)) {
        setSymbol(val);
      }
    }
  };

  return (
    <div
      className="min-h-screen overflow-hidden text-[var(--text-primary)]"
      style={{
        background: "var(--bg-primary)",
        fontFamily: "Outfit, sans-serif",
      }}
    >
      {/* ── Header ── */}
      <header
        className="flex items-center justify-between px-6 flex-shrink-0"
        style={{
          background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border)",
          height: "60px",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
            style={{ background: "var(--accent)" }}
          >
            <span className="font-mono text-[13px] font-bold text-[var(--bg-primary)]">
              ST
            </span>
          </div>
          <div>
            <h1 className="font-outfit text-[16px] font-bold text-[var(--text-primary)] leading-none tracking-tight">
              StockTrack
            </h1>
            <p className="font-mono text-[9px] text-[var(--text-muted)] tracking-widest uppercase mt-1 leading-none">
              Market Tracker
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[16px] pointer-events-none transition-colors duration-150"
            style={{ color: focused ? "var(--accent)" : "var(--text-muted)" }}
          >
            ⌕
          </span>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.toUpperCase())}
            onKeyDown={handleSearch}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search & hit Enter..."
            maxLength={10}
            spellCheck={false}
            autoComplete="off"
            className="font-mono text-[13px] tracking-wider rounded-lg pl-9 pr-4 py-2 outline-none transition-all duration-150"
            style={{
              background: "var(--bg-elevated)",
              border: `1px solid ${focused ? "var(--accent)" : "var(--border)"}`,
              color: "var(--text-primary)",
              width: "230px",
              boxShadow: focused ? "0 0 0 3px rgba(77,159,255,0.12)" : "none",
            }}
          />
        </div>
      </header>

      {/* ── Ticker ── */}
      <TopStrip />

      {/* ── Dashboard ── */}
      <StockDashboard symbol={symbol} />
    </div>
  );
};

export default App;
