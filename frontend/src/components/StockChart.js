import { useState, useEffect } from "react";
import api from "../api";
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
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const buildChartData = (data) => ({
  labels: data.map((item) =>
    item.time.includes(" ") ? item.time.split(" ")[1] : item.time,
  ),
  datasets: [
    {
      label: "Price",
      data: data.map((item) => item.price),
      borderColor: "#4d9fff",
      backgroundColor: (ctx) => {
        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, "rgba(77, 159, 255, 0.18)");
        gradient.addColorStop(0.6, "rgba(77, 159, 255, 0.04)");
        gradient.addColorStop(1, "rgba(77, 159, 255, 0)");
        return gradient;
      },
      fill: true,
      tension: 0.45,
      borderWidth: 2,
      pointRadius: 4,
      pointBackgroundColor: "#4d9fff",
      pointBorderColor: "#0e1117",
      pointBorderWidth: 2,
      pointHoverRadius: 7,
      pointHoverBackgroundColor: "#4d9fff",
      pointHoverBorderColor: "#e4e8f0",
      pointHoverBorderWidth: 2,
    },
  ],
});

const buildChartOptions = (symbol) => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "index", intersect: false },
  scales: {
    y: {
      beginAtZero: false,
      grid: { color: "rgba(30, 37, 53, 0.7)" },
      border: { color: "#1e2535" },
      ticks: {
        color: "#4a5568",
        font: { family: "Space Mono", size: 10 },
        padding: 8,
        callback: (val) => `$${val.toFixed(2)}`,
      },
    },
    x: {
      grid: { color: "rgba(30, 37, 53, 0.4)" },
      border: { color: "#1e2535" },
      ticks: {
        color: "#4a5568",
        font: { family: "Space Mono", size: 10 },
        maxRotation: 0,
        padding: 8,
      },
    },
  },
  plugins: {
    legend: { display: false },
    title: {
      display: true,
      text: `${symbol}  ·  Price History`,
      color: "#8892a4",
      font: { family: "Outfit", size: 13, weight: "500" },
      padding: { bottom: 20 },
      align: "start",
    },
    tooltip: {
      backgroundColor: "#141820",
      borderColor: "#1e2535",
      borderWidth: 1,
      titleColor: "#8892a4",
      bodyColor: "#e4e8f0",
      bodyFont: { family: "Space Mono", size: 13, weight: "700" },
      titleFont: { family: "Outfit", size: 11 },
      padding: 14,
      displayColors: false,
      callbacks: {
        label: (ctx) => ` $${ctx.parsed.y.toFixed(4)}`,
      },
    },
  },
});

const StockChart = ({ symbol }) => {
  const [chartData, setChartData] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        // Hit our new SQLite database route
        const res = await api.get(`/api/chart/${symbol}`);

        if (res.data && res.data.length > 0) {
          setChartData(buildChartData(res.data));
          setErr(null);
        } else {
          setErr("No historical data available yet. Waiting for backend sync.");
          setChartData(null);
        }
      } catch (error) {
        setErr(
          error.response?.data?.message || "Failed to fetch historical data",
        );
        setChartData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [symbol]);

  return (
    <div
      className="rounded-xl p-5 mt-5"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="relative h-[300px]">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="spinner" />
          </div>
        ) : err ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-[var(--negative)] text-[13px]">{err}</p>
          </div>
        ) : chartData ? (
          <Line data={chartData} options={buildChartOptions(symbol)} />
        ) : (
          <div className="flex justify-center items-center h-full">
            <p className="text-[var(--text-muted)] text-[13px]">
              No chart data available
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockChart;
