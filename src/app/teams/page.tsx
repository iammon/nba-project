// src/app/teams/page.tsx
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import TeamChart from "@/components/TeamChart";

type SearchParams = {
  q?: string;
  teamId?: string;
};

type TeamRow = {
  id: number;
  city: string | null;
  nickname: string | null;
  abbreviation: string | null;
};

type RawTeamSeasonRow = {
  season: number;
  games_played: number;
  wins: number;
  pts_for: number;
  pts_against: number;
};

type TeamSeasonStat = {
  season: number;
  games_played: number;
  wins: number;
  losses: number;
  win_pct: number | null;
  pts_for: number;
  pts_against: number;
  avg_pts_for: number | null;
  avg_pts_against: number | null;
};

function makeTeamName(t: TeamRow): string {
  const city = t.city ?? "";
  const nick = t.nickname ?? "";
  if (city || nick) {
    return `${city}${city && nick ? " " : ""}${nick}`.trim();
  }
  return t.abbreviation ?? `Team ${t.id}`;
}

export default async function TeamsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim() || null;

  const selectedTeamId =
    sp.teamId && !Number.isNaN(Number(sp.teamId))
      ? Number(sp.teamId)
      : null;

  // 1) Search teams by city / nickname / abbreviation
  const teams: TeamRow[] =
    q
      ? await prisma.$queryRaw<TeamRow[]>`
          SELECT id, city, nickname, abbreviation
          FROM teams
          WHERE
            (city IS NOT NULL AND city ILIKE '%' || ${q} || '%')
            OR (nickname IS NOT NULL AND nickname ILIKE '%' || ${q} || '%')
            OR (abbreviation IS NOT NULL AND abbreviation ILIKE '%' || ${q} || '%')
          ORDER BY city NULLS LAST, nickname NULLS LAST, id ASC
          LIMIT 100
        `
      : [];

  // 2) If a team is selected, fetch its REGULAR SEASON stats by season
  let seasonStats: TeamSeasonStat[] = [];
  let selectedTeamName: string | null = null;
  let selectedTeamAbbr: string | null = null;

  if (selectedTeamId != null) {
    let fromList = teams.find((t) => t.id === selectedTeamId);

    if (!fromList) {
      const row = await prisma.$queryRaw<TeamRow[]>`
        SELECT id, city, nickname, abbreviation
        FROM teams
        WHERE id = ${selectedTeamId}
        LIMIT 1
      `;
      if (row.length > 0) {
        fromList = row[0];
      }
    }

    if (fromList) {
      selectedTeamName = makeTeamName(fromList);
      selectedTeamAbbr = fromList.abbreviation;
    }

    if (selectedTeamName) {
      const rawRows = await prisma.$queryRaw<RawTeamSeasonRow[]>`
        SELECT
          g.season::int AS season,
          COUNT(*)::int AS games_played,
          SUM(
            CASE
              WHEN (g.home_team_id = ${selectedTeamId} AND g.home_team_wins = true)
                OR (g.visitor_team_id = ${selectedTeamId} AND g.home_team_wins = false)
              THEN 1
              ELSE 0
            END
          )::int AS wins,
          SUM(
            CASE
              WHEN g.home_team_id = ${selectedTeamId} THEN g.home_points
              ELSE g.visitor_points
            END
          )::int AS pts_for,
          SUM(
            CASE
              WHEN g.home_team_id = ${selectedTeamId} THEN g.visitor_points
              ELSE g.home_points
            END
          )::int AS pts_against
        FROM games g
        JOIN game_types t ON t.game_id = g.id
        WHERE t.game_type = 'Regular'
          AND (g.home_team_id = ${selectedTeamId} OR g.visitor_team_id = ${selectedTeamId})
        GROUP BY g.season
        ORDER BY g.season ASC
      `;

      seasonStats = rawRows.map((r) => {
        const losses = r.games_played - r.wins;
        const win_pct =
          r.games_played > 0 ? r.wins / r.games_played : null;
        const avg_pts_for =
          r.games_played > 0 ? r.pts_for / r.games_played : null;
        const avg_pts_against =
          r.games_played > 0 ? r.pts_against / r.games_played : null;

        return {
          season: r.season,
          games_played: r.games_played,
          wins: r.wins,
          losses,
          win_pct,
          pts_for: r.pts_for,
          pts_against: r.pts_against,
          avg_pts_for,
          avg_pts_against,
        };
      });
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Teams</h1>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/players" className="text-blue-600 hover:underline">
            Players
          </Link>
          <span className="text-gray-400">•</span>
          <span className="font-semibold text-black">Teams</span>
          <span className="text-gray-400">•</span>
          <Link href="/" className="text-blue-600 hover:underline">
            Home
          </Link>
        </nav>
      </header>

      {/* Search form */}
      <form className="flex items-center gap-2" action="/teams" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by city, nickname, or abbreviation…"
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
        Showing <span className="font-medium">{teams.length}</span> result
        {teams.length === 1 ? "" : "s"}
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

      {/* Team list */}
      <ul className="grid gap-3">
        {teams.map((t) => {
          const name = makeTeamName(t);
          return (
            <li
              key={t.id}
              className={`rounded-2xl border p-4 shadow-sm hover:shadow transition ${
                t.id === selectedTeamId
                  ? "border-blue-500 ring-1 ring-blue-300"
                  : "border-gray-200"
              }`}
            >
              <Link
                href={{
                  pathname: "/teams",
                  query: {
                    q: q ?? "",
                    teamId: t.id.toString(),
                  },
                }}
                className="flex items-center justify-between"
              >
                <div>
                  <div className="text-base sm:text-lg font-semibold underline">
                    {name}
                  </div>
                  <div className="text-xs text-gray-500">
                    ID: {t.id}
                    {t.abbreviation ? ` • ${t.abbreviation}` : null}
                  </div>
                </div>
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500 uppercase">
                  {t.abbreviation || name.slice(0, 3)}
                </div>
              </Link>
            </li>
          );
        })}
        {teams.length === 0 && (
          <li className="text-gray-500">No teams found.</li>
        )}
      </ul>

      {/* Season stats + chart for selected team */}
      {selectedTeamName && seasonStats.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            Regular-season stats for{" "}
            <span className="font-bold">
              {selectedTeamName}
              {selectedTeamAbbr ? ` (${selectedTeamAbbr})` : ""}
            </span>
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-2 py-1 border">Season</th>
                  <th className="px-2 py-1 border">GP</th>
                  <th className="px-2 py-1 border">W</th>
                  <th className="px-2 py-1 border">L</th>
                  <th className="px-2 py-1 border">Win%</th>
                  <th className="px-2 py-1 border">PTS For</th>
                  <th className="px-2 py-1 border">PTS Against</th>
                  <th className="px-2 py-1 border">Avg PF</th>
                  <th className="px-2 py-1 border">Avg PA</th>
                </tr>
              </thead>
              <tbody>
                {seasonStats.map((s) => (
                  <tr key={s.season}>
                    <td className="px-2 py-1 border">{s.season}</td>
                    <td className="px-2 py-1 border">{s.games_played}</td>
                    <td className="px-2 py-1 border">{s.wins}</td>
                    <td className="px-2 py-1 border">{s.losses}</td>
                    <td className="px-2 py-1 border">
                      {s.win_pct != null ? (s.win_pct * 100).toFixed(1) + "%" : "–"}
                    </td>
                    <td className="px-2 py-1 border">{s.pts_for}</td>
                    <td className="px-2 py-1 border">{s.pts_against}</td>
                    <td className="px-2 py-1 border">
                      {s.avg_pts_for != null ? s.avg_pts_for.toFixed(1) : "–"}
                    </td>
                    <td className="px-2 py-1 border">
                      {s.avg_pts_against != null
                        ? s.avg_pts_against.toFixed(1)
                        : "–"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <TeamChart stats={seasonStats} />
        </section>
      )}
    </main>
  );
}
