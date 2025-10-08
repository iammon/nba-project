import { prisma } from "@/lib/prisma";

export default async function PlayersPage() {
  const players = await prisma.$queryRawUnsafe<{ id:number; name:string }[]>(`
    SELECT id, name
    FROM players
    ORDER BY id ASC
    LIMIT 100
  `);

  return (
    <main className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Players</h1>
      <ul className="space-y-2">
        {players.map(p => (
          <li key={p.id} className="border rounded p-3">{p.name}</li>
        ))}
      </ul>
    </main>
  );
}
