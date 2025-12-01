'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

type Option = {
  id: number;
  name: string;
};

export default function SetupPage() {
  const router = useRouter();

  const [teamQuery, setTeamQuery] = useState('');
  const [playerQuery, setPlayerQuery] = useState('');

  const [teamResults, setTeamResults] = useState<Option[]>([]);
  const [playerResults, setPlayerResults] = useState<Option[]>([]);

  const [selectedTeam, setSelectedTeam] = useState<Option | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Option | null>(null);

  const [error, setError] = useState<string | null>(null);

  async function searchTeams() {
    setError(null);
    if (!teamQuery.trim()) {
      setTeamResults([]);
      return;
    }

    try {
      const res = await fetch(`/api/search-teams?q=${encodeURIComponent(teamQuery)}`);
      const data = await res.json();
      setTeamResults(data.results ?? []);
    } catch (err) {
      console.error(err);
      setError('Could not search teams.');
    }
  }

  async function searchPlayers() {
    setError(null);
    if (!playerQuery.trim()) {
      setPlayerResults([]);
      return;
    }

    try {
      const res = await fetch(`/api/search-players?q=${encodeURIComponent(playerQuery)}`);
      const data = await res.json();
      setPlayerResults(data.results ?? []);
    } catch (err) {
      console.error(err);
      setError('Could not search players.');
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setError(null);

  if (!selectedTeam || !selectedPlayer) {
    setError('Please select one favorite team and one favorite player.');
    return;
  }

  try {
    const res = await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        favoriteTeamId: selectedTeam.id,
        favoritePlayerId: selectedPlayer.id,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.message || 'Could not save favorites.');
      return;
    }

    // Successfully saved → go to main app page
    router.push('/players');
  } catch (err) {
    console.error(err);
    setError('Something went wrong while saving favorites.');
  }
}

  return (
    <main className="mx-auto max-w-3xl p-8 space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome!</h1>
      <p className="text-gray-600">
        Before we start, choose your favorite NBA team and player from the database.
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Favorite Team */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Favorite Team</h2>

          <div className="flex gap-2">
            <input
              className="flex-1 rounded-md border px-3 py-2 text-sm"
              placeholder="Search for a team (e.g. Lakers)"
              value={teamQuery}
              onChange={(e) => setTeamQuery(e.target.value)}
            />
            <button
              type="button"
              onClick={searchTeams}
              className="rounded-xl px-3 py-2 bg-black text-white text-sm hover:bg-gray-800"
            >
              Search
            </button>
          </div>

          {teamResults.length > 0 && (
            <ul className="border rounded-lg divide-y max-h-56 overflow-y-auto text-sm">
              {teamResults.map((team) => (
                <li key={team.id}>
                  <button
                    type="button"
                    className={`w-full text-left px-3 py-2 ${
                      selectedTeam?.id === team.id
                        ? 'bg-black text-white'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedTeam(team)}
                  >
                    {team.name}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {selectedTeam && (
            <p className="text-xs text-gray-600">
              Selected team: <span className="font-medium">{selectedTeam.name}</span>
            </p>
          )}
        </section>

        {/* Favorite Player */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Favorite Player</h2>

          <div className="flex gap-2">
            <input
              className="flex-1 rounded-md border px-3 py-2 text-sm"
              placeholder="Search for a player (e.g. LeBron James)"
              value={playerQuery}
              onChange={(e) => setPlayerQuery(e.target.value)}
            />
            <button
              type="button"
              onClick={searchPlayers}
              className="rounded-xl px-3 py-2 bg-black text-white text-sm hover:bg-gray-800"
            >
              Search
            </button>
          </div>

          {playerResults.length > 0 && (
            <ul className="border rounded-lg divide-y max-h-56 overflow-y-auto text-sm">
              {playerResults.map((player) => (
                <li key={player.id}>
                  <button
                    type="button"
                    className={`w-full text-left px-3 py-2 ${
                      selectedPlayer?.id === player.id
                        ? 'bg-black text-white'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedPlayer(player)}
                  >
                    {player.name}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {selectedPlayer && (
            <p className="text-xs text-gray-600">
              Selected player:{' '}
              <span className="font-medium">{selectedPlayer.name}</span>
            </p>
          )}
        </section>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          className="rounded-xl px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800"
        >
          Continue
        </button>
      </form>
    </main>
  );
}
