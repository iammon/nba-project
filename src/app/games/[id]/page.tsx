import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function GameDetails({ params }: { params: { id: string } }) {
  const gameId = Number(params.id);

  // Fetch game + team info
  const game = await prisma.games.findUnique({
    where: { id: gameId },
    include: {
      home_team: true,
      away_team: true,
    },
  });

  if (!game) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-bold">Game not found</h1>
      </main>
    );
  }

  // Fetch boxscores for that game
  const boxscores = await prisma.boxscores.findMany({
    where: { game_id: gameId },
    include: {
      players: true,
      teams: true,
    },
    orderBy: [
      { team_id: "asc" },
      { player_id: "asc" },
    ],
  });

  // Split home/away players
  const home = boxscores.filter(b => b.team_id === game.home_team_id);
  const away = boxscores.filter(b => b.team_id === game.away_team_id);

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-6">

      {/* HEADER */}
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {game.away_team?.full_name} @ {game.home_team?.full_name}
        </h1>
        <Link href="/games" className="text-blue-600 text-sm hover:underline">Back to Games</Link>
      </header>

      <p className="text-gray-600">
        {new Date(game.game_date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </p>

      {/* AWAY TEAM */}
      <section>
        <h2 className="text-xl font-semibold mb-3">{game.away_team?.full_name}</h2>
        <div className="grid gap-3">
          {away.map(player => (
            <div key={player.player_id} className="border rounded-xl p-4 shadow-sm">
              <div className="font-semibold">{player.players.name}</div>
              <div className="text-xs text-gray-500">
                Team: {player.teams?.abbreviation ?? "Unknown"}
              </div>
              <div className="grid grid-cols-6 gap-4 mt-2 text-center">
                <Stat label="PTS" val={player.pts} />
                <Stat label="REB" val={player.reb} />
                <Stat label="AST" val={player.ast} />
                <Stat label="FG" val={`${player.fgm}/${player.fga}`} />
                <Stat label="3PT" val={`${player.fg3m}/${player.fg3a}`} />
                <Stat label="FT" val={`${player.ftm}/${player.fta}`} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOME TEAM */}
      <section>
        <h2 className="text-xl font-semibold mb-3">{game.home_team?.full_name}</h2>
        <div className="grid gap-3">
          {home.map(player => (
            <div key={player.player_id} className="border rounded-xl p-4 shadow-sm">
              <div className="font-semibold">{player.players.name}</div>
              <div className="text-xs text-gray-500">
                Team: {player.teams?.abbreviation ?? "Unknown"}
              </div>
              <div className="grid grid-cols-6 gap-4 mt-2 text-center">
                <Stat label="PTS" val={player.pts} />
                <Stat label="REB" val={player.reb} />
                <Stat label="AST" val={player.ast} />
                <Stat label="FG" val={`${player.fgm}/${player.fga}`} />
                <Stat label="3PT" val={`${player.fg3m}/${player.fg3a}`} />
                <Stat label="FT" val={`${player.ftm}/${player.fta}`} />
              </div>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}

function Stat({ label, val }: { label: string; val: any }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-semibold">{val ?? 0}</div>
    </div>
  );
}