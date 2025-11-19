"use client";

import { useState } from "react";

export default function BoxscoreExpand({ gameId }: { gameId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[] | null>(null);

  async function toggle() {
    if (open) {
      setOpen(false);
      return;
    }

    if (!rows) {
      setLoading(true);
      const res = await fetch(`/api/boxscore?game_id=${gameId}`);
      const data = await res.json();
      setRows(data);
      setLoading(false);
    }

    setOpen(true);
  }

  return (
    <div className="mt-4">
      <button
        onClick={toggle}
        className="text-sm px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
      >
        {open ? "Hide Boxscore" : "View Boxscore"}
      </button>

      {/* Expanded Panel */}
      {open && (
        <div className="mt-4 border rounded-2xl p-4 bg-gray-50">
          {loading && <p>Loading boxscore…</p>}

          {!loading && rows && rows.length === 0 && (
            <p className="text-gray-500 text-sm">No boxscore data.</p>
          )}

          {!loading && rows && rows.length > 0 && (
            <div className="space-y-4">
              {rows.map((box, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-gray-200 p-3 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                    {/* PLAYER + INFO */}
                    <div className="space-y-1">
                      <div className="text-base sm:text-lg font-semibold">
                        {box.player_name}
                      </div>
                      <div className="text-xs text-gray-500 space-x-3">
                        <span>Team: {box.team_name ?? box.team_abbr ?? "Unknown"}</span>
                        <span>Season {box.season}</span>
                      </div>
                    </div>

                    {/* MAIN STATS */}
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 text-center">
                      <Stat label="PTS" value={box.pts} />
                      <Stat label="REB" value={box.reb} />
                      <Stat label="AST" value={box.ast} />
                      <Stat label="FG" value={`${box.fgm}/${box.fga}`} />
                      <Stat label="3PT" value={`${box.fg3m}/${box.fg3a}`} />
                      <Stat label="FT" value={`${box.ftm}/${box.fta}`} />
                    </div>

                    {/* SECONDARY */}
                    <div className="grid grid-cols-3 gap-3 text-center sm:border-l sm:pl-4">
                      <Stat label="STL" value={box.stl} />
                      <Stat label="BLK" value={box.blk} />
                      <Stat label="TOV" value={box.tov} />
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-semibold text-lg">{value ?? 0}</div>
    </div>
  );
}
