import React from "react";

const TopStrip = () => {
  const indices = [
    { name: "DOW", value: "40,813.57", change: "-1.30%" },
    { name: "NASDAQ", value: "17,303.01", change: "1.96%" },
    { name: "RUSSELL 2000", value: "1,993.69", change: "-1.45%" },
    { name: "DOW", value: "40,813.57", change: "-1.30%" },
    { name: "NASDAQ", value: "17,303.01", change: "-1.96%" },
    { name: "RUSSELL 2000", value: "1,993.69", change: "-1.45%" },
    { name: "DOW", value: "40,813.57", change: "-1.30%" },
    { name: "NASDAQ", value: "17,303.01", change: "1.96%" },
    { name: "RUSSELL 2000", value: "1,993.69", change: "-1.45%" },
    { name: "DOW", value: "40,813.57", change: "-1.30%" },
    { name: "NASDAQ", value: "17,303.01", change: "-1.96%" },
    { name: "RUSSELL 2000", value: "1,993.69", change: "-1.45%" },
  ];
  return (
    <div className="flex flex-row w-full h-10 px-6 sm:px-16 md:px-24 bg-emerald-950">
      <h1 className="font-semibold text-base pt-2 mr-8 italic text-gray-500">
        Popular
      </h1>
      <div className="flex flex-row justify-evenly items-center w-full px-2 overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
        {indices.map((index) => (
          <div key={index.name} className="flex flex-row mr-8 text-xs">
            <p className="mr-2">{index.name.slice(0, 5)}</p>
            <p
              className={`${
                index.change.startsWith("-") ? "text-red-500" : "text-green-500"
              } `}
            >
              {index.change}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopStrip;
