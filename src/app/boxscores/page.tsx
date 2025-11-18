// src/app/boxscores/page.tsx
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";

type SearchParams = {
  q?: string;
};

export default async function BoxscorePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = searchParams;
  const q = (sp.q ?? "").trim() || null;

  const boxscores = 
    q
      ? await prisma.$queryRaw<{
          game_id: bigint;
          player_id: number;
          player_name: string;
          team_id: number | null;
          team_name: string | null;
          team_abbr: string | null;
          season: number | null;
          game_date: Date;
          pts: number | null;
          ast: number | null;
          reb: number | null;
          fgm: number | null;
          fga: number | null;
          fg3m: number | null;
          fg3a: number | null;
          ftm: number | null;
          fta: number | null;
          stl: number | null;
          blk: number | null;
          tov: number | null;
      }[]>`
        SELECT
          b.game_id,
          b.player_id,
          p.name AS player_name,
          t.full_name AS team_name,
          t.abbreviation AS team_abbr,
          g.season,
          g.game_date,
          b.pts, b.reb, b.ast,
          b.fgm, b.fga,
          b.fg3m, b.fg3a,
          b.ftm, b.fta,
          b.stl, b.blk, b.tov
        FROM boxscores b
        INNER JOIN players p ON b.player_id = p.id
        INNER JOIN games g ON b.game_id = g.id
        LEFT JOIN teams t ON b.team_id = t.id
        WHERE 
          p.name ILIKE ${`%${q}%`} OR
          t.full_name ILIKE ${`%${q}%`} OR
          t.abbreviation ILIKE ${`%${q}%`} OR
          t.city ILIKE ${`%${q}%`} OR
          t.nickname ILIKE ${`%${q}%`} OR
          CAST(g.season AS TEXT) ILIKE ${`%${q}%`} OR
          CAST(g.game_date AS TEXT) ILIKE ${`%${q}%`} OR
          CAST(b.pts AS TEXT) ILIKE ${`%${q}%`} OR
          CAST(b.ast AS TEXT) ILIKE ${`%${q}%`} OR
          CAST(b.reb AS TEXT) ILIKE ${`%${q}%`}
        ORDER BY g.game_date DESC, p.name ASC
        LIMIT 200
      `
    : [];  // No query => show nothing

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Boxscores</h1>
        <Link href="/" className="text-sm text-blue-600 hover:underline">Home</Link>
      </header>
      <form className="flex items-center gap-2" action="/boxscores" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by player, team, season, or date…"
          className="w-full rounded-xl border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="rounded-xl px-4 py-2 bg-black text-white hover:bg-gray-800">
          Search
        </button>
      </form>
      <div className="text-sm text-gray-600">
        Showing <span className="font-medium">{boxscores.length}</span> result
        {boxscores.length === 1 ? "" : "s"}
        {q && (
          <>
            {" for "}
            <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">
              {q}
            </span>
          </>
        )}
      </div>
      {boxscores.length === 0 ? (
        q ? (
          <div className="text-gray-500">No boxscores found.</div>
        ) : (
          <div className="text-gray-500">Enter player/team/season to search.</div>
        )
      ) : (
        <div className="overflow-x-auto">
          <div className="grid gap-3">
            {boxscores.map((box, idx) => {
              const gameDate = new Date(box.game_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });

              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                    {/* PLAYER + INFO */}
                    <div className="space-y-1">
                      <div className="text-base sm:text-lg font-semibold">
                        {box.player_name}
                      </div>
                      <div className="text-xs text-gray-500 space-x-3">
                        <span>{gameDate}</span>
                        <span>Season {box.season}</span>
                        <span>Team: {box.team_name ?? box.team_abbr ?? "Unknown"}</span>
                      </div>
                    </div>

                    {/* MAIN STATS */}
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 text-center">
                      <div>
                        <div className="text-xs text-gray-500">PTS</div>
                        <div className="font-semibold text-lg">{box.pts ?? 0}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">REB</div>
                        <div className="font-semibold">{box.reb ?? 0}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">AST</div>
                        <div className="font-semibold">{box.ast ?? 0}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">FG</div>
                        <div className="text-sm">{box.fgm ?? 0}/{box.fga ?? 0}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">3PT</div>
                        <div className="text-sm">{box.fg3m ?? 0}/{box.fg3a ?? 0}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">FT</div>
                        <div className="text-sm">{box.ftm ?? 0}/{box.fta ?? 0}</div>
                      </div>
                    </div>

                    {/* SECONDARY STATS */}
                    <div className="grid grid-cols-3 gap-3 text-center sm:border-l sm:pl-4">
                      <div>
                        <div className="text-xs text-gray-500">STL</div>
                        <div className="font-medium">{box.stl ?? 0}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">BLK</div>
                        <div className="font-medium">{box.blk ?? 0}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">TOV</div>
                        <div className="font-medium">{box.tov ?? 0}</div>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
