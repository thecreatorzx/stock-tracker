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
  // date time
  const now = new Date();

  // called every time the symbol value change
  useEffect(() => {
    const fetchData = async () => {
      try {
        // fetch stock data
        const stockRes = await axios.get(
          `https://stock-tracker-lxmh.onrender.com/api/stock/${symbol}`
        );
        setStockData(stockRes.data);

        // fetch price change
        const priceChangeRes = await axios.get(
          `https://stock-tracker-lxmh.onrender.com/api/price-change/${symbol}`
        );
        setPriceChange(priceChangeRes.data);

        // fetch sma
        const smaRes = await axios.get(
          `https://stock-tracker-lxmh.onrender.com/api/sma/${symbol}`
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
    <div className="flex sticky top-0 lg:flex-row flex-col px-4 sm:px-14 md:px-24 lg:px-0 lg:w-[100vw] lg:h-[80vh]">
      {/* sidebar */}
      <IndicesSidebar />
      {/* main content */}
      <div
        className="flex w-full h-full lg:w-[100vw] lg:ml-2 p-6 lg:overflow-y-scroll
    lg:overflow-y-auto lg:scrollbar-thin lg:scrollbar-thumb-gray-500 lg:scrollbar-track-transparent"
      >
        {err && <p className="text-red-500">{err}</p>}
        {stockData ? (
          <div className="w-full h-full">
            <div className="w-full flex flex-col lg:flex-row justify-between">
              <h2 className="text-2xl font-semibold mb-6">
                {stockData.symbol}

                {/* date time  */}
                <span className="relative bottom-2 ml-6 text-gray-500 text-xxs">
                  AS OF &nbsp;
                  {` ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} ${now.getDate()}-${
                    now.getMonth() + 1
                  }-${now.getFullYear()}`}
                </span>
              </h2>
              <div className="flex flex-row">
                <p className="text-4xl mr-4 mt-1">${stockData.price}</p>
                {priceChange && (
                  <p
                    className={`${
                      priceChange.price_change >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    } text-xs mt-1`}
                  >
                    <span className="text-gray-500">AT CLOSE - </span>
                    {priceChange.price_change.toFixed(2)}%
                  </p>
                )}
                {sma && (
                  <p className="text-lg font-semibold mt-4 ml-4 lg:ml-0 lg:mt-8">
                    SMA: {sma.sma.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-row flex-wrap">
              <StockChart symbol={symbol} />
              <StockChart symbol={symbol} />
              <StockChart symbol={symbol} />
            </div>
          </div>
        ) : (
          <p>Loading ...</p>
        )}
      </div>
    </div>
  );
};

export default StockDashboard;
