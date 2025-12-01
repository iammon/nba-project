// src/components/TeamChart.tsx
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

type TeamSeasonStat = {
  season: number;
  games_played: number;
  wins: number;
  losses: number;
  win_pct: number | null;
  avg_pts_for: number | null;
  avg_pts_against: number | null;
};

export default function TeamChart({ stats }: { stats: TeamSeasonStat[] }) {
  if (!stats || stats.length === 0) return null;

  const seasons = stats.map((s) => s.season);

  const data = {
    labels: seasons,
    datasets: [
      {
        label: "Win % (×100)",
        data: stats.map((s) =>
          s.win_pct != null ? Number((s.win_pct * 100).toFixed(1)) : null
        ),
        borderColor: "#22c55e",
        backgroundColor: "rgba(34, 197, 94, 0.2)",
        tension: 0.2,
        yAxisID: "y",
      },
      {
        label: "Avg Points For",
        data: stats.map((s) =>
          s.avg_pts_for != null ? Number(s.avg_pts_for.toFixed(1)) : null
        ),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        tension: 0.2,
        yAxisID: "y1",
      },
      {
        label: "Avg Points Against",
        data: stats.map((s) =>
          s.avg_pts_against != null ? Number(s.avg_pts_against.toFixed(1)) : null
        ),
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.2)",
        tension: 0.2,
        yAxisID: "y1",
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
          text: "Win %",
        },
        beginAtZero: true,
        suggestedMax: 100,
      },
      y1: {
        position: "right" as const,
        title: {
          display: true,
          text: "Points Per Game",
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold mb-3">
        Team Trends (Regular Season)
      </h3>
      <Line data={data} options={options} />
    </div>
  );
}
