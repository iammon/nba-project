// src/app/teams/page.tsx
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";

type SearchParams = { q?: string };

export default async function PlayersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim() || null;

  const teams =
    q
      ? await prisma.$queryRaw<{ 
        id: number; 
        abbreviation: string | null;
        nickname: string | null;
        city: string | null;
        min_year: number | null;
        max_year: number | null; 
    }[]>`
          SELECT id, abbreviation, nickname, city, min_year, max_year
          FROM teams
          WHERE city ILIKE '%' || ${q} || '%'
            OR nickname ILIKE '%' || ${q} || '%'
            OR abbreviation ILIKE '%' || ${q} || '%'
          ORDER BY city ASC, nikcname ASC
          LIMIT 100
        `
      : []; // 👈 no query => show nothing

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Teams</h1>
        <Link href="/" className="text-sm text-blue-600 hover:underline">Home</Link>
      </header>

      <form className="flex items-center gap-2" action="/teams" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by city, name, or abbreviation…"
          className="w-full rounded-xl border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="rounded-xl px-4 py-2 bg-black text-white hover:bg-gray-800">
          Search
        </button>
      </form>

      <div className="text-sm text-gray-600">
        Showing <span className="font-medium">{teams.length}</span> result{teams.length === 1 ? "" : "s"}
        {q ? <> for <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">{q}</span></> : null}
      </div>

      <ul className="grid gap-3">
        {teams.map(t => (
          <li key={t.id} className="rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow transition">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-base sm:text-lg font-semibold">
                  {t.city} {t.nickname}
                </div>
                <div className="text-xs text-gray-500">
                  {t.abbreviation && <span className="font-mono">{t.abbreviation}</span>}
                  {t.abbreviation && (t.min_year || t.max_year) && <span className="mx-2">•</span>}
                  {t.min_year && t.max_year && <span>{t.min_year}-{t.max_year}</span>}
                  <span className="ml-2 text-gray-400">ID: {t.id}</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-700">
                {t.abbreviation || t.nickname?.slice(0, 2).toUpperCase() || "??"}
              </div>
            </div>
          </li>
        ))}
        {teams.length === 0 && <li className="text-gray-500">No teams found.</li>}
      </ul>
    </main>
  );
}

