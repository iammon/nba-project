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
      if (typeof parsed.userId === "number") userId = parsed.userId;
      if (typeof parsed.username === "string") username = parsed.username;
    } catch {
      // bad cookie, ignore
    }
  }

  // If not logged in, just show a simple page
  if (!userId) {
    return (
      <main className="mx-auto max-w-3xl p-8 space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          NBA Explorer
        </h1>
        <p className="text-gray-600">
          You&apos;re not logged in. You can still browse players from the{" "}
          <Link href="/players" className="text-blue-600 underline">
            Players page
          </Link>
          , or{" "}
          <Link href="/" className="text-blue-600 underline">
            go back home
          </Link>
          .
        </p>
      </main>
    );
  }

  // Get favorites (READ from user_fav + joined tables)
  const rows = await prisma.$queryRaw<FavRow[]>`
    SELECT
      f.favorite_player_id,
      f.favorite_team_id,
      p.name AS player_name,
      (t.city || ' ' || t.nickname) AS team_name
    FROM user_fav f
    LEFT JOIN players p ON p.id = f.favorite_player_id
    LEFT JOIN teams   t ON t.id = f.favorite_team_id
    WHERE f.user_id = ${userId}
    LIMIT 1
  `;

  const fav = rows[0] ?? null;

  const favoritePlayerLink = fav?.favorite_player_id
    ? `/players?playerId=${fav.favorite_player_id}`
    : "/players";

  const favoriteTeamLink = fav?.favorite_team_id
    ? `/teams?teamId=${fav.favorite_team_id}`
    : "/teams";

  return (
    <main className="mx-auto max-w-3xl p-8 space-y-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            NBA Explorer
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Welcome{username ? `, ${username}` : ""}! This page shows what we can
            do with your data in the database.
          </p>
        </div>
        <Link
          href="/"
          className="text-sm text-blue-600 hover:underline"
        >
          Home
        </Link>
      </header>

      {/* Favorites summary (READ from DB) */}
      <section className="border rounded-xl p-4 space-y-2 bg-white shadow-sm">
        <h2 className="text-lg font-semibold">Your Favorites</h2>
        {fav ? (
          <ul className="text-sm text-gray-700 space-y-1">
            <li>
              <span className="font-medium">Favorite player:</span>{" "}
              {fav.player_name ?? "Not set"}
            </li>
            <li>
              <span className="font-medium">Favorite team:</span>{" "}
              {fav.team_name ?? "Not set"}
            </li>
          </ul>
        ) : (
          <p className="text-sm text-gray-600">
            You haven&apos;t chosen favorites yet.
          </p>
        )}
      </section>

      {/* Navigation: go to player / team pages with pre-loaded favorites */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Explore Stats</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Link
            href={favoritePlayerLink}
            className="block rounded-xl border border-gray-200 bg-black text-white text-center px-4 py-3 text-sm font-medium hover:bg-gray-800"
          >
            View Player Stats
          </Link>
          <Link
            href={favoriteTeamLink}
            className="block rounded-xl border border-gray-200 bg-black text-white text-center px-4 py-3 text-sm font-medium hover:bg-gray-800"
          >
            View Team Stats
          </Link>
        </div>

      </section>

      {/* Manage account: UPDATE + DELETE */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Manage Account</h2>
        <div className="flex flex-wrap gap-3 items-center">
          {/* UPDATE favorites: goes to /setup, which writes to user_fav */}
          <Link
            href="/setup"
            className="rounded-xl px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            Update Favorites
          </Link>

          {/* DELETE account: submits to /api/delete-account */}
          <form
            action="/api/delete-account"
            method="post"
            className="inline"
          >
            <button
              type="submit"
              className="rounded-xl px-4 py-2 bg-red-600 text-white text-sm font-medium hover:bg-red-700"
            >
              Delete Account
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
