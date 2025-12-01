// src/app/explore/page.tsx
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import Link from "next/link";

type FavRow = {
  favorite_player_id: number | null;
  favorite_team_id: number | null;
  player_name: string | null;
  team_name: string | null;
};

export default async function ExplorePage() {
  // ⬇️ CHANGE IS HERE
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("nba_session")?.value;

  let userId: number | null = null;
  let username: string | null = null;

  if (sessionCookie) {
    try {
      const parsed = JSON.parse(sessionCookie) as {
        userId?: number;
        username?: string;
      };
      if (typeof parsed.userId === "number") {
        userId = parsed.userId;
      }
      if (typeof parsed.username === "string") {
        username = parsed.username;
      }
    } catch {
      // bad cookie, ignore
    }
  }

  if (!userId) {
    // No session: gentle message + link home
    return (
      <main className="mx-auto max-w-3xl p-6 space-y-4">
        <h1 className="text-2xl font-bold">NBA Explorer</h1>
        <p className="text-gray-600">
          You&apos;re not logged in. Please{" "}
          <Link href="/" className="text-blue-600 underline">
            go back to the home page
          </Link>{" "}
          and log in.
        </p>
      </main>
    );
  }

  // Look up favorites for this user
  const rows = await prisma.$queryRaw<FavRow[]>`
    SELECT 
      f.favorite_player_id,
      p.name AS player_name,
      f.favorite_team_id,
      COALESCE(
        CASE 
          WHEN t.city IS NOT NULL AND t.nickname IS NOT NULL
          THEN (t.city || ' ' || t.nickname)
          WHEN t.city IS NOT NULL THEN t.city
          WHEN t.nickname IS NOT NULL THEN t.nickname
          ELSE t.abbreviation
        END,
        'Unknown team'
      ) AS team_name
    FROM user_fav f
    LEFT JOIN players p ON p.id = f.favorite_player_id
    LEFT JOIN teams t ON t.id = f.favorite_team_id
    WHERE f.user_id = ${userId}
    LIMIT 1
  `;

  const fav = rows[0] ?? null;

  if (!fav) {
    // User exists but has no favorites (safety net)
    return (
      <main className="mx-auto max-w-3xl p-6 space-y-4">
        <h1 className="text-2xl font-bold">NBA Explorer</h1>
        <p className="text-gray-700">
          Hi{username ? `, ${username}` : ""}! You don&apos;t have favorites set up yet.
        </p>
        <Link
          href="/setup"
          className="inline-flex mt-4 rounded-xl px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800"
        >
          Set up favorites
        </Link>
      </main>
    );
  }

  const { favorite_player_id, favorite_team_id, player_name, team_name } = fav;

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            NBA Explorer
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Hi{username ? `, ${username}` : ""}! Choose where you want to start.
          </p>
        </div>
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          Home
        </Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        {/* Favorite player card */}
        <div className="border rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold mb-1">Favorite Player</h2>
            {favorite_player_id && player_name ? (
              <p className="text-sm text-gray-700">{player_name}</p>
            ) : (
              <p className="text-sm text-gray-500">
                You don&apos;t have a favorite player set.
              </p>
            )}
          </div>
          <div className="mt-4">
            {favorite_player_id ? (
              <Link
                href={`/players?playerId=${favorite_player_id}`}
                className="inline-flex rounded-xl px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800"
              >
                Go to player stats
              </Link>
            ) : (
              <Link
                href="/setup"
                className="inline-flex rounded-xl px-4 py-2 bg-gray-200 text-sm font-medium hover:bg-gray-300"
              >
                Set favorite player
              </Link>
            )}
          </div>
        </div>

        {/* Favorite team card */}
        <div className="border rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold mb-1">Favorite Team</h2>
            {favorite_team_id && team_name ? (
              <p className="text-sm text-gray-700">{team_name}</p>
            ) : (
              <p className="text-sm text-gray-500">
                You don&apos;t have a favorite team set.
              </p>
            )}
          </div>
          <div className="mt-4">
            {favorite_team_id ? (
              <Link
                href={`/teams?teamId=${favorite_team_id}`}
                className="inline-flex rounded-xl px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800"
              >
                Go to team stats
              </Link>
            ) : (
              <Link
                href="/setup"
                className="inline-flex rounded-xl px-4 py-2 bg-gray-200 text-sm font-medium hover:bg-gray-300"
              >
                Set favorite team
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="text-sm text-gray-600">
        <p>
          Want to explore more? You can always search for any player or team
          once you&apos;re on the stats pages.
        </p>
        <div className="mt-2 flex gap-3">
          <Link
            href="/players"
            className="text-blue-600 hover:underline"
          >
            Go to Players page
          </Link>
          <span className="text-gray-400">•</span>
          <Link
            href="/teams"
            className="text-blue-600 hover:underline"
          >
            Go to Teams page
          </Link>
        </div>
      </section>
    </main>
  );
}
