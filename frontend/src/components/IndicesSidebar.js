function IndicesSidebar() {
  const indices = [
    { name: "DOW", value: "40,813.57", change: "-1.30%" },
    { name: "NASDAQ", value: "17,303.01", change: "-1.96%" },
    { name: "RUSSELL 2000", value: "1,993.69", change: "-1.45%" },
    { name: "DOW", value: "40,813.57", change: "-1.30%" },
    { name: "NASDAQ", value: "17,303.01", change: "-1.96%" },
    { name: "RUSSELL 2000", value: "1,993.69", change: "-1.45%" },
    { name: "DOW", value: "40,813.57", change: "-1.30%" },
    { name: "NASDAQ", value: "17,303.01", change: "-1.96%" },
    { name: "RUSSELL 2000", value: "1,993.69", change: "-1.45%" },
    { name: "RUSSELL 2000", value: "1,993.69", change: "-1.45%" },
    { name: "DOW", value: "40,813.57", change: "-1.30%" },
    { name: "NASDAQ", value: "17,303.01", change: "-1.96%" },
    { name: "RUSSELL 2000", value: "1,993.69", change: "-1.45%" },
  ];

  return (
    <div
      className="w-full h-full lg:h-[80vh] lg:w-[26vw] lg:max-w-[300px] lg:ml-28 lg:mt-1 lg:pb-8 
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
