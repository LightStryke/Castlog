'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Leaderboard() {
  const [tab, setTab] = useState('alltime')
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)

  const rankEmoji = (rank) => {
    if (rank === 'Legend') return '👑'
    if (rank === 'Tarpon') return '🦈'
    if (rank === 'Bass') return '🐟'
    return '🪱'
  }

  const getDateFilter = () => {
    const now = new Date()
    if (tab === 'daily') {
      const start = new Date(now)
      start.setHours(0, 0, 0, 0)
      return start.toISOString()
    }
    if (tab === 'weekly') {
      const start = new Date(now)
      start.setDate(now.getDate() - 7)
      return start.toISOString()
    }
    return null
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const dateFilter = getDateFilter()

      let query = supabase
        .from('catches')
        .select('user_id, weight_lbs, profiles(username, rank, xp)')

      if (dateFilter) {
        query = query.gte('created_at', dateFilter)
      }

      const { data } = await query

      // Group by user and sum weight
      const grouped = {}
      data?.forEach((c) => {
        const uid = c.user_id
        if (!grouped[uid]) {
          grouped[uid] = {
            username: c.profiles?.username || 'Angler',
            rank: c.profiles?.rank || 'Minnow',
            xp: c.profiles?.xp || 0,
            totalWeight: 0,
            catchCount: 0,
          }
        }
        grouped[uid].totalWeight += parseFloat(c.weight_lbs || 0)
        grouped[uid].catchCount += 1
      })

      const sorted = Object.values(grouped).sort((a, b) => b.totalWeight - a.totalWeight)
      setLeaders(sorted)
      setLoading(false)
    }
    load()
  }, [tab])

  const medals = ['🥇', '🥈', '🥉']

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <a href="/feed" className="text-gray-400 hover:text-white">← Feed</a>
        <h1 className="text-xl font-bold text-emerald-400">🏆 Leaderboard</h1>
        <div className="w-16" />
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Tabs */}
        <div className="flex bg-gray-900 border border-gray-800 rounded-xl p-1 mb-6">
          {['daily', 'weekly', 'alltime'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-emerald-500 text-black' : 'text-gray-400 hover:text-white'}`}
            >
              {t === 'daily' ? 'Today' : t === 'weekly' ? 'This week' : 'All time'}
            </button>
          ))}
        </div>

        {loading && <p className="text-gray-400 text-center">Loading...</p>}

        {!loading && leaders.length === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🎣</p>
            <p className="text-gray-400">No catches logged in this period yet!</p>
          </div>
        )}

        {leaders.map((angler, i) => (
          <div key={angler.username} className={`bg-gray-900 border rounded-2xl p-5 mb-3 flex items-center gap-4 ${i === 0 ? 'border-yellow-500' : 'border-gray-800'}`}>
            <span className="text-2xl">{medals[i] || `#${i + 1}`}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold">{angler.username}</span>
                <span className="text-xs text-emerald-400">{rankEmoji(angler.rank)} {angler.rank}</span>
              </div>
              <div className="flex gap-4 text-sm text-gray-400 mt-1">
                <span>⚖️ {angler.totalWeight.toFixed(1)} lbs total</span>
                <span>🎣 {angler.catchCount} catches</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-emerald-400 font-bold">{angler.xp} XP</p>
            </div>
          </div>
        ))}

      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex">
        <a href="/feed" className="flex-1 py-4 text-center text-sm text-gray-400 hover:text-white">🎣 Feed</a>
        <a href="/post" className="flex-1 py-4 text-center text-sm text-gray-400 hover:text-white">+ Post</a>
        <a href="/leaderboard" className="flex-1 py-4 text-center text-sm text-emerald-400 font-semibold">🏆 Ranks</a>
        <a href="/profile" className="flex-1 py-4 text-center text-sm text-gray-400 hover:text-white">👤 Profile</a>
      </div>

    </main>
  )
}