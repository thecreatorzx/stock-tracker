import { useState } from "react";
import StockDashboard from "./components/StockDashboard";
import "./App.css";
import TopStrip from "./components/TopStrip";

const App = () => {
  const [symbol, setSymbol] = useState("AAPL");

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* header */}
      <header className="bg-gray-800 lg:bg-gray-900 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Stock Price Tracker</h1>
        <>
          <input
            type="text"
            value={symbol}
            onChange={(e) => {
              setSymbol(e.target.value.toUpperCase());
            }}
            placeholder="Search stocks (e.g., AAPL)"
            className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none"
          />
        </>
      </header>
      {/* top strip */}
      <TopStrip />
      {/* main */}
      <StockDashboard symbol={symbol} />
    </div>
  );
};

export default App;
