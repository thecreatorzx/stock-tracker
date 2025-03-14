function IndicesSidebar() {
  const indices = [
    { name: "DOW", value: "40,813.57", change: "-1.30%" },
    { name: "NASDAQ", value: "17,303.01", change: "-1.96%" },
    { name: "RUSSELL 2000", value: "1,993.69", change: "-1.45%" },
  ];

  return (
    <div className="w-64 bg-gray-800 p-4">
      <h3 className="text-lg font-semibold mb-4">Global Market</h3>
      {indices.map((index) => (
        <div key={index.name} className="mb-2">
          <p>{index.name}</p>
          <p
            className={
              index.change.startsWith("-") ? "text-red-500" : "text-green-500"
            }
          >
            {index.value} {index.change}
          </p>
        </div>
      ))}
    </div>
  );
}

export default IndicesSidebar;
