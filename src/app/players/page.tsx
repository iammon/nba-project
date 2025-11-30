// src/app/players/page.tsx
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";

type SearchParams = {
  q?: string;
  playerId?: string;
};

type SeasonStat = {
  season: number;
  games_played: number;
  total_pts: number | null;
  avg_pts: number | null;
  total_reb: number | null;
  avg_reb: number | null;
  total_ast: number | null;
  avg_ast: number | null;
  fg_pct: number | null;
  fg3_pct: number | null;
  ft_pct: number | null;
  total_minutes_s: number | null;
  mpg: number | null;
};

export default async function PlayersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim() || null;

  // selected player id from query string (e.g. ?playerId=123)
  const selectedPlayerId =
    sp.playerId && !Number.isNaN(Number(sp.playerId))
      ? Number(sp.playerId)
      : null;

  // 1) Search players by name (same as before)
  const players =
    q
      ? await prisma.$queryRaw<{ id: number; name: string }[]>`
          SELECT id, name
          FROM players
          WHERE name ILIKE '%' || ${q} || '%'
          ORDER BY id ASC
          LIMIT 100
        `
      : [];

  // 2) If we have a selectedPlayerId, fetch that player's season-by-season stats
  let seasonStats: SeasonStat[] = [];
  let selectedPlayerName: string | null = null;

  if (selectedPlayerId != null) {
    // try to get the name from the search results first
    const fromList = players.find((p) => p.id === selectedPlayerId);

    if (fromList) {
      selectedPlayerName = fromList.name;
    } else {
      // fallback: fetch directly from DB in case it wasn't in the current search
      const playerRow = await prisma.$queryRaw<{ id: number; name: string }[]>`
        SELECT id, name
        FROM players
        WHERE id = ${selectedPlayerId}
        LIMIT 1
      `;
      if (playerRow.length > 0) {
        selectedPlayerName = playerRow[0].name;
      }
    }

    // only fetch stats if we found a player
    if (selectedPlayerName) {
      seasonStats = await prisma.$queryRaw<SeasonStat[]>`
  SELECT
    g.season::int                         AS season,
    COUNT(*)::int                         AS games_played,
    SUM(b.pts)::float                     AS total_pts,
    AVG(b.pts)::float                     AS avg_pts,
    SUM(b.reb)::float                     AS total_reb,
    AVG(b.reb)::float                     AS avg_reb,
    SUM(b.ast)::float                     AS total_ast,
    AVG(b.ast)::float                     AS avg_ast,
    CASE
      WHEN SUM(b.fga) > 0
      THEN (SUM(b.fgm)::float / SUM(b.fga)::float)
      ELSE NULL
    END                                   AS fg_pct,
    CASE
      WHEN SUM(b.fg3a) > 0
      THEN (SUM(b.fg3m)::float / SUM(b.fg3a)::float)
      ELSE NULL
    END                                   AS fg3_pct,
    CASE
      WHEN SUM(b.fta) > 0
      THEN (SUM(b.ftm)::float / SUM(b.fta)::float)
      ELSE NULL
    END                                   AS ft_pct,
    SUM(b.minutes_s)::float               AS total_minutes_s,
    CASE
      WHEN COUNT(*) > 0 AND SUM(b.minutes_s) IS NOT NULL
      THEN (SUM(b.minutes_s)::float / COUNT(*)::float / 60.0)
      ELSE NULL
    END                                   AS mpg
  FROM boxscores b
  JOIN games g ON g.id = b.game_id
  JOIN game_types t ON t.game_id = g.id
  WHERE b.player_id = ${selectedPlayerId}
    AND t.game_type = 'Regular'
  GROUP BY g.season
  ORDER BY g.season ASC
`;
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Players</h1>
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          Home
        </Link>
      </header>

      {/* Search form */}
      <form className="flex items-center gap-2" action="/players" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by name…"
          className="w-full rounded-xl border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="rounded-xl px-4 py-2 bg-black text-white hover:bg-gray-800"
        >
          Search
        </button>
      </form>

      <div className="text-sm text-gray-600">
        Showing <span className="font-medium">{players.length}</span> result
        {players.length === 1 ? "" : "s"}
        {q ? (
          <>
            {" "}
            for{" "}
            <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">
              {q}
            </span>
          </>
        ) : null}
      </div>

      {/* Player list */}
      <ul className="grid gap-3">
        {players.map((p) => (
          <li
            key={p.id}
            className={`rounded-2xl border p-4 shadow-sm hover:shadow transition ${
              p.id === selectedPlayerId
                ? "border-blue-500 ring-1 ring-blue-300"
                : "border-gray-200"
            }`}
          >
            <Link
              href={{
                pathname: "/players",
                query: {
                  q: q ?? "",
                  playerId: p.id.toString(),
                },
              }}
              className="flex items-center justify-between"
            >
              <div>
                <div className="text-base sm:text-lg font-semibold underline">
                  {p.name}
                </div>
                <div className="text-xs text-gray-500">ID: {p.id}</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                {p.name
                  .split(" ")
                  .map((s) => s[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            </Link>
          </li>
        ))}
        {players.length === 0 && (
          <li className="text-gray-500">No players found.</li>
        )}
      </ul>

      {/* Season-by-season stats when a player is selected */}
      {selectedPlayerName && seasonStats.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">
            Season stats for{" "}
            <span className="font-bold">{selectedPlayerName}</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-2 py-1 border">Season</th>
                  <th className="px-2 py-1 border">GP</th>
                  <th className="px-2 py-1 border">MPG</th>
                  <th className="px-2 py-1 border">PTS</th>
                  <th className="px-2 py-1 border">REB</th>
                  <th className="px-2 py-1 border">AST</th>
                  <th className="px-2 py-1 border">FG%</th>
                  <th className="px-2 py-1 border">3P%</th>
                  <th className="px-2 py-1 border">FT%</th>
                </tr>
              </thead>
              <tbody>
                {seasonStats.map((s) => (
                  <tr key={s.season}>
                    <td className="px-2 py-1 border">{s.season}</td>
                    <td className="px-2 py-1 border">{s.games_played}</td>
                    <td className="px-2 py-1 border">
                      {s.mpg != null ? s.mpg.toFixed(1) : "–"}
                    </td>
                    <td className="px-2 py-1 border">
                      {s.avg_pts?.toFixed(1)}{" "}
                      <span className="text-[10px] text-gray-500">
                        ({s.total_pts?.toFixed(0)})
                      </span>
                    </td>
                    <td className="px-2 py-1 border">
                      {s.avg_reb?.toFixed(1)}{" "}
                      <span className="text-[10px] text-gray-500">
                        ({s.total_reb?.toFixed(0)})
                      </span>
                    </td>
                    <td className="px-2 py-1 border">
                      {s.avg_ast?.toFixed(1)}{" "}
                      <span className="text-[10px] text-gray-500">
                        ({s.total_ast?.toFixed(0)})
                      </span>
                    </td>
                    <td className="px-2 py-1 border">
                      {s.fg_pct != null ? (s.fg_pct * 100).toFixed(1) + "%" : "–"}
                    </td>
                    <td className="px-2 py-1 border">
                      {s.fg3_pct != null ? (s.fg3_pct * 100).toFixed(1) + "%" : "–"}
                    </td>
                    <td className="px-2 py-1 border">
                      {s.ft_pct != null ? (s.ft_pct * 100).toFixed(1) + "%" : "–"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
