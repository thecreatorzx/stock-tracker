import { useState } from "react";
import StockDashboard from "./components/StockDashboard";
import "./App.css";
import TopStrip from "./components/TopStrip";

const App = () => {
  const [symbol, setSymbol] = useState("AAPL");

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Header */}
      <header className="bg-gray-800 lg:bg-gray-900 p-4 flex justify-between items-center">
        <h1 className="pl-5 text-base sm:text-2xl md:text-3xl lg:text-4xl font-serif font-bold">
          Stock Price Tracker
        </h1>

        {/* Search Box with Icon */}
        <div className="relative box-border">
          <span className="absolute left-5 top-5 text-gray-400">🔍</span>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="Search stocks..."
            className="p-2 pl-10 rounded-3xl bg-gray-600 text-white border focus:border-gray-400 border-gray-600 focus:outline-none"
          />
        </div>
      </header>

      {/* Top Strip */}
      <TopStrip />

      {/* Main Content */}
      <StockDashboard symbol={symbol} />
    </div>
  );
};

export default App;
