// Simple server component for the home page
export default function Home() {
  return (
    <main className="mx-auto max-w-3xl p-8 space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">NBA Project</h1>
      <p className="text-gray-600">
        Next.js + PostgreSQL + Prisma. Use the link below to view players from the database.
      </p>

      <a
        href="/players"
        className="inline-block rounded-xl px-4 py-2 bg-black text-white hover:bg-gray-800"
      >
        View Players
      </a>
    </main>
  );
}
