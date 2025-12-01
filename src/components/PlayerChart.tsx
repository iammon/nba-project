"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

type SeasonStat = {
  season: number;
  avg_pts: number | null;
  avg_reb: number | null;
  avg_ast: number | null;
  mpg: number | null;
};

export default function PlayerChart({ stats }: { stats: SeasonStat[] }) {
  if (!stats || stats.length === 0) return null;

  const seasons = stats.map((s) => s.season);

  const data = {
    labels: seasons,
    datasets: [
      {
        label: "PTS",
        data: stats.map((s) => s.avg_pts),
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.2)",
        tension: 0.2,
      },
      {
        label: "REB",
        data: stats.map((s) => s.avg_reb),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        tension: 0.2,
      },
      {
        label: "AST",
        data: stats.map((s) => s.avg_ast),
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        tension: 0.2,
      },
      {
        label: "MPG",
        data: stats.map((s) => s.mpg),
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.2)",
        tension: 0.2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      tooltip: { mode: "index" as const, intersect: false },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Season",
        },
      },
      y: {
        title: {
          display: true,
          text: "Per-game stats",
        },
        beginAtZero: false,
      },
    },
  };

  return (
    <div className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold mb-3">
        Season Trends (Regular Season)
      </h3>
      <Line data={data} options={options} />
    </div>
  );
}
