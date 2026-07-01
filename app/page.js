export default function Home() {
  return (
    <main className="min-h-screen text-white">

      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-emerald-400">🎣 CastLog</h1>
          <p className="text-xs text-gray-400">The angler's arena</p>
        </div>
        <button className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-4 py-2 rounded-lg text-sm">
          Sign up
        </button>
      </div>

      {/* Hero */}
      <div className="px-6 py-12 text-center">
        <h2 className="text-4xl font-bold mb-3">Fish. Post. Compete.</h2>
        <p className="text-gray-400 text-lg mb-8">Level up your angling, log every catch, and go head-to-head with anglers worldwide.</p>
        <button className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 py-3 rounded-xl text-lg">
          Start fishing →
        </button>
      </div>

      {/* Feature cards */}
      <div className="px-6 grid grid-cols-2 gap-4 max-w-lg mx-auto">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-2xl mb-2">🏆</div>
          <h3 className="font-semibold text-sm mb-1">Leaderboards</h3>
          <p className="text-gray-400 text-xs">Daily, weekly and all-time rankings</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-2xl mb-2">📊</div>
          <h3 className="font-semibold text-sm mb-1">Angler stats</h3>
          <p className="text-gray-400 text-xs">Radar chart of your fishing strengths</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-2xl mb-2">🐟</div>
          <h3 className="font-semibold text-sm mb-1">Species log</h3>
          <p className="text-gray-400 text-xs">Catch checklist — your fishing Pokédex</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-2xl mb-2">⚔️</div>
          <h3 className="font-semibold text-sm mb-1">Tournaments</h3>
          <p className="text-gray-400 text-xs">Weekly challenges against other anglers</p>
        </div>
      </div>

      {/* Rank preview */}
      <div className="px-6 py-10 text-center">
        <p className="text-gray-400 text-sm mb-4">Climb the ranks</p>
        <div className="flex justify-center gap-3 flex-wrap">
          {["🪱 Minnow", "🐟 Bass", "🦈 Tarpon", "👑 Legend"].map((rank) => (
            <span key={rank} className="bg-gray-800 border border-gray-700 px-3 py-1 rounded-full text-sm">
              {rank}
            </span>
          ))}
        </div>
      </div>

    </main>
  )
}