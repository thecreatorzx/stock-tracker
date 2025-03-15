// chart component !!

import { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const StockChart = ({ symbol }) => {
  const [history, setHistory] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/history/${symbol}`)
      .then((res) => {
        const data = res.data.history;
        setHistory({
          labels: data.map((item) => item.time.split(" ")[1]),
          datasets: [
            {
              lable: "Price",
              data: data.map((item) => item.price),
              borderColor: "rgba(255, 99, 132, 1",
              backgroundColor: "rgba(255,99,132,0.2)",
              fill: false,
            },
          ],
        });
        setErr(false);
      })
      .catch(() => {
        setErr(true);
      });
  }, [symbol]);

  return (
    <div className="mt-6 flex justify-center w-full h-72">
      {history ? (
        <>
          <Line
            data={history}
            options={{
              responsive: true,
              scales: { y: { beginAtZero: false } },
            }}
          />
          {err && (
            <p className="text-red-500 mt-2">
              Failed to fetch new data. Showing previous data.
            </p>
          )}
        </>
      ) : (
        <p className="text-gray-500">Loading stock data...</p>
      )}
    </div>
  );
};

export default StockChart;
