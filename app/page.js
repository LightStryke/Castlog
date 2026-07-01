export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-emerald-400">🎣 CastLog</h1>
          <p className="text-xs text-gray-400">The angler's arena</p>
        </div>
        <a href="/auth" className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-4 py-2 rounded-lg text-sm">
          Sign up
        </a>
      </div>

      {/* Hero */}
      <div className="px-6 py-16 text-center max-w-lg mx-auto">
        <h2 className="text-4xl font-bold mb-4">Fish. Post. Compete.</h2>
        <p className="text-gray-400 text-lg mb-8">Level up your angling, log every catch, and go head-to-head with anglers worldwide.</p>
        <a href="/auth" className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 py-3 rounded-xl text-lg inline-block">
          Start fishing →
        </a>
      </div>

      {/* Feature cards */}
      <div className="px-6 grid grid-cols-2 gap-4 max-w-lg mx-auto">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-2xl mb-2">🏆</div>
          <h3 className="font-semibold text-sm mb-1">Leaderboards</h3>
          <p className="text-gray-400 text-xs">Daily, weekly and all-time rankings by weight</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-2xl mb-2">📊</div>
          <h3 className="font-semibold text-sm mb-1">Angler stats</h3>
          <p className="text-gray-400 text-xs">Track your catches and climb the ranks</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-2xl mb-2">🐟</div>
          <h3 className="font-semibold text-sm mb-1">Species log</h3>
          <p className="text-gray-400 text-xs">86 species to catch — your fishing Pokédex</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-2xl mb-2">⚔️</div>
          <h3 className="font-semibold text-sm mb-1">Community</h3>
          <p className="text-gray-400 text-xs">Vote on catches, flag fakes, earn badges</p>
        </div>
      </div>

      {/* Rank preview */}
      <div className="px-6 py-12 text-center max-w-lg mx-auto">
        <p className="text-gray-400 text-sm mb-4">Climb the ranks</p>
        <div className="flex justify-center gap-3 flex-wrap">
          {['🪱 Minnow', '🐟 Bass', '🦈 Tarpon', '👑 Legend'].map((rank) => (
            <span key={rank} className="bg-gray-800 border border-gray-700 px-3 py-1 rounded-full text-sm">
              {rank}
            </span>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="text-center pb-16">
        <a href="/auth" className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 py-3 rounded-xl text-lg inline-block">
          Create your free account
        </a>
        <p className="text-gray-500 text-xs mt-4">Free forever. No domain needed.</p>
      </div>

    </main>
  )
}