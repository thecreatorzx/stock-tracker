import { useState } from "react";

function IndicesSidebar() {
  const [fetchedIndices, setFetchedIndices] = useState([]);
  const [error, setError] = useState(null);

  const symbols = [
    "DOW",
    "IXIC",
    "RUT",
    "DOW",
    "IXIC",
    "RUT",
    "DOW",
    "IXIC",
    "RUT",
    "RUT",
    "DOW",
    "IXIC",
    "RUT",
  ];
  React.useEffect(() => {
    const fetchIndicesData = async () => {
      try {
        const indicesData = await Promise.all(
          symbols.map(async (symbol) => {
            // Fetch stock data for price using Axios
            const stockResponse = await axios.get(
              `http://localhost:5000/api/stock/${symbol}`
            );

            // Fetch price change using Axios
            const priceChangeResponse = await axios.get(
              `http://localhost:5000/api/price-change/${symbol}`
            );

            return {
              name:
                symbol === "IXIC"
                  ? "NASDAQ"
                  : symbol === "RUT"
                  ? "RUSSELL 2000"
                  : symbol,
              value: stockResponse.data.price.toFixed(2), // Use price as the value
              change:
                priceChangeResponse.data.price_change >= 0
                  ? `+${priceChangeResponse.data.price_change.toFixed(2)}%`
                  : `${priceChangeResponse.data.price_change.toFixed(2)}%`,
            };
          })
        );
        setFetchedIndices(indicesData);
        setError(null);
      } catch (err) {
        setError("Failed to fetch market data");
        setFetchedIndices([]);
      }
    };

    fetchIndicesData();
  }, []);

  return (
    <div
      className="w-full h-full lg:h-[80vh] lg:w-[32vw] lg:max-w-[340px] lg:min-w-[280px] lg:ml-28 lg:mt-1 lg:pb-8 
  lg:bg-gray-800 lg:flex lg:flex-col lg:items-center"
    >
      <h3 className="text-lg font-semibold my-2 lg:text-xl lg:mb-8 lg:border lg:border-t-transparent lg:border-x-transparent">
        Global Market
      </h3>

      {/* Wrapper to enable both scrolling directions */}
      <div className="w-full h-full overflow-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent">
        <div
          className="flex flex-row lg:flex-col lg:justify-between lg:items-center w-full pb-2 
      overflow-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent"
        >
          {indices.map((index, i) => (
            <div
              key={i}
              className="flex flex-row justify-around items-center lg:w-full h-10 lg:h-16 
          pl-2 mr-5 bg-gray-700 lg:mx-0 lg:bg-transparent hover:bg-gray-600 cursor-pointer 
          lg:border lg:border-y-gray-500 lg:border-x-transparent min-w-max"
            >
              <p className="text-xs lg:text-base w-16 lg:pr-24">
                {index.name.length > 5
                  ? index.name.slice(0, 5) + "..."
                  : index.name}
              </p>
              <p
                className={`${
                  index.change.startsWith("-")
                    ? "text-red-500"
                    : "text-green-500"
                } text-xs w-14`}
              >
                {index.value} {index.change}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default IndicesSidebar;
