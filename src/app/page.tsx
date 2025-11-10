// Simple server component for the home page
export default function Home() {
  return (
    <main className="mx-auto max-w-3xl p-8 space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">NBA Project</h1>
      <p className="text-gray-600">
        Seacrh for Players or Teams in the NBA.
      </p>

      <div className="flex flex-col gap-3">
        <a
          href="/players"
          className="inline-block rounded-xl px-4 py-2 bg-black text-white hover:bg-gray-800"
        >
          View Players
        </a>
        <a
          href="/teams"
          className="inline-block rounded-xl px-4 py-2 bg-black text-white hover:bg-gray-800"
        >
          View Teams
        </a>
      </div>
    </main>
  );
}
