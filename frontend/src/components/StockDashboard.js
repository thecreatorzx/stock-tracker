// dashboard component
import { useState, useEffect } from "react";
import axios from "axios";
import IndicesSidebar from "./IndicesSidebar";
import StockChart from "./StockChart";

const StockDashboard = ({ symbol }) => {
  const [stockData, setStockData] = useState(null);
  const [priceChange, setPriceChange] = useState(null);
  const [sma, setSma] = useState(null);
  const [err, setErr] = useState(null);

  // called every time the symbol value change
  useEffect(() => {
    const fetchData = async () => {
      try {
        // fetch stock data
        const stockRes = await axios.get(
          `http://localhost:5000/api/stock/${symbol}`
        );
        setStockData(stockRes.data);

        // fetch price change
        const priceChangeRes = await axios.get(
          `http://localhost:5000/api/price-change/${symbol}`
        );
        setPriceChange(priceChangeRes.data);

        // fetch sma
        const smaRes = await axios.get(
          `http://locahost:5000/api/sma/${symbol}`
        );
        setSma(smaRes.data);

        setErr(null);
      } catch (err) {
        setErr("Error fetching data");
        setStockData(null);
        setPriceChange(null);
        setSma(null);
      }
    };
    fetchData();
  }, [symbol]);

  return (
    <div className="flex">
      {/* sidebar */}
      <IndicesSidebar />
      {/* main content */}
      <div className="flex-1 p-6">
        {err && <p className="text-red-500">{err}</p>}
        {stockData ? (
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">{stockData.symbol}</h2>
              <div>
                <p className="text-lg">Price : ${stockData.price}</p>
                {priceChange && (
                  <p
                    className={
                      priceChange.price_change >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    Change: {priceChange.price_change.toFixed(2)}%
                  </p>
                )}
                {sma && <p>SMA: {sma.sma.toFixed(2)}</p>}
              </div>
            </div>
            <StockChart symbol={symbol} />
          </div>
        ) : (
          <p>Loading ...</p>
        )}
      </div>
    </div>
  );
};

export default StockDashboard;
