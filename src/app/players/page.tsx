// src/app/players/page.tsx
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";

type SearchParams = { q?: string };

export default async function PlayersPage({
  searchParams,
}: {
  // 👇 Next 15: searchParams is async
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;           // ✅ await it
  const q = (sp.q ?? "").trim() || null;

  const players = await prisma.$queryRaw<{ id: number; name: string }[]>`
    SELECT id, name
    FROM players
    WHERE ${q}::text IS NULL
       OR name ILIKE '%' || ${q} || '%'
    ORDER BY id ASC
    LIMIT 100
  `;

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Players</h1>
        <Link href="/" className="text-sm text-blue-600 hover:underline">Home</Link>
      </header>

      <form className="flex items-center gap-2" action="/players" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by name…"
          className="w-full rounded-xl border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="rounded-xl px-4 py-2 bg-black text-white hover:bg-gray-800">
          Search
        </button>
      </form>

      <div className="text-sm text-gray-600">
        Showing <span className="font-medium">{players.length}</span> result{players.length === 1 ? "" : "s"}
        {q ? <> for <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">{q}</span></> : null}
      </div>

      <ul className="grid gap-3">
        {players.map(p => (
          <li key={p.id} className="rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow transition">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-base sm:text-lg font-semibold">{p.name}</div>
                <div className="text-xs text-gray-500">ID: {p.id}</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                {p.name.split(" ").map(s => s[0]).join("").slice(0,2).toUpperCase()}
              </div>
            </div>
          </li>
        ))}
        {players.length === 0 && <li className="text-gray-500">No players found.</li>}
      </ul>
    </main>
  );
}


