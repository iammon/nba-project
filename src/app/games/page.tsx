// src/app/games/pages.tsx
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";

type SearchParams = { q?: string };

export default async function GamesPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
})  {
    const sp = await searchParams;
    const q = (sp.q ?? "").trim() || null;

    const games = 
        q
          ? await prisma.$queryRaw<{
            id: BigInt;
            season: number | null;
            game_date: Date | null;
            home_points: number | null;
            visitor_points: number | null;
            home_team_wins: boolean | null;
            home_city: string | null;
            home_nickname: string | null;
            home_abbr: string | null;
            visitor_city: string | null;
            visitor_nickname: string | null;
            visitor_abbr: string | null;
          }[]>`
            SELECT 
              g.id,
              g.season,
              g.game_date,
              g.home_points,
              g.visitor_points,
              g.home_team_wins,
              ht.city as home_city,
              ht.nickname as home_nickname,
              ht.abbreviation as home_abbr,
              vt.city as visitor_city,
              vt.nickname as visitor_nickname,
              vt.abbreviation as visitor_abbr
            FROM games g
            LEFT JOIN teams ht ON g.home_team_id = ht.id
            LEFT JOIN teams vt ON g.visitor_team_id = vt.id
            WHERE 
              ht.city ILIKE ${`%${q}%`}
              OR ht.nickname ILIKE ${`%${q}%`}
              OR ht.abbreviation ILIKE ${`%${q}%`}
              OR vt.city ILIKE ${`%${q}%`}
              OR vt.nickname ILIKE ${`%${q}%`}
              OR vt.abbreviation ILIKE ${`%${q}%`}
              OR CAST(g.season AS TEXT) ILIKE ${`%${q}%`}
            ORDER BY g.game_date DESC, g.id DESC
            LIMIT 100
          `
    : []; // No query => show nothing
        
    return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Games</h1>
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          Home
        </Link>
      </header>

      <form className="flex items-center gap-2" action="/games" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by team name, city, or season…"
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
        Showing <span className="font-medium">{games.length}</span> result
        {games.length === 1 ? "" : "s"}
        {q ? (
          <>
            {" "}
            for{" "}
            <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">{q}</span>
          </>
        ) : null}
      </div>

      <ul className="grid gap-3">
        {games.map((g) => {
          const homeTeam = g.home_city && g.home_nickname 
            ? `${g.home_city} ${g.home_nickname}`
            : g.home_abbr || "Unknown";
          const visitorTeam = g.visitor_city && g.visitor_nickname
            ? `${g.visitor_city} ${g.visitor_nickname}`
            : g.visitor_abbr || "Unknown";
          const gameDate = g.game_date 
            ? new Date(g.game_date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })
            : "Unknown Date";

          return (
            <li
              key={g.id.toString()}
              className="rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow transition"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{gameDate}</span>
                  <span>Season {g.season}</span>
                </div>
                
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 text-right">
                    <div className="text-base sm:text-lg font-semibold">
                      {visitorTeam}
                    </div>
                    {g.visitor_abbr && (
                      <div className="text-xs text-gray-500 font-mono">
                        {g.visitor_abbr}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 px-4">
                    <div className={`text-xl font-bold ${!g.home_team_wins ? 'text-green-600' : 'text-gray-700'}`}>
                      {g.visitor_points ?? '-'}
                    </div>
                    <div className="text-gray-400">@</div>
                    <div className={`text-xl font-bold ${g.home_team_wins ? 'text-green-600' : 'text-gray-700'}`}>
                      {g.home_points ?? '-'}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="text-base sm:text-lg font-semibold">
                      {homeTeam}
                    </div>
                    {g.home_abbr && (
                      <div className="text-xs text-gray-500 font-mono">
                        {g.home_abbr}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-xs text-gray-400 text-center">
                  Game ID: {g.id.toString()}
                </div>
              </div>
            </li>
          );
        })}
        {games.length === 0 && (
          <li className="text-gray-500">No games found.</li>
        )}
      </ul>
    </main>
  );
}
