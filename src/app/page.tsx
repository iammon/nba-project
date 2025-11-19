// Simple server component for the home page
export default function Home() {
  const menuItems = [
    {
      title: "Players",
      description: "Search and explore NBA players.",
      href: "/players",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "Teams",
      description: "Browse all NBA teams.",
      href: "/teams",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "Games",
      description: "View games and expand boxscores inline.",
      href: "/games",
      color: "bg-purple-500 hover:bg-purple-600",
    },
  ];

  return (
    <main className="mx-auto max-w-5xl p-8 space-y-10">
      {/* HEADER */}
      <section className="text-center space-y-3">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          NBA Stats Dashboard
        </h1>
        <p className="text-gray-600 text-lg">
          Explore players, teams, and games — now with inline boxscores.
        </p>
      </section>

      {/* MENU CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <a
            key={item.title}
            href={item.href}
            className={`group p-6 rounded-2xl shadow-md transition transform hover:scale-105 ${item.color} text-white`}
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <h2 className="text-2xl font-bold">{item.title}</h2>
                <p className="mt-2 text-sm opacity-90">{item.description}</p>
              </div>
              <div className="mt-4 text-right text-3xl opacity-70 group-hover:opacity-100 transition">
                →
              </div>
            </div>
          </a>
        ))}
      </section>
    </main>
  );
}
