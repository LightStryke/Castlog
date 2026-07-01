'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getRankFromXp } from '../lib/ranks.js'

export default function Leaderboard() {
  const [tab, setTab] = useState('alltime')
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)

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
        .eq('leaderboard_eligible', true)

      if (dateFilter) {
        query = query.gte('created_at', dateFilter)
      }

      const { data } = await query

      const grouped = {}
      data?.forEach((c) => {
        const uid = c.user_id
        if (!grouped[uid]) {
          grouped[uid] = {
            username: c.profiles?.username || 'Angler',
            rank: getRankFromXp(c.profiles?.xp || 0).name,
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
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-emerald-400">🏆 Leaderboard</h1>
            <p className="text-gray-400 text-sm">Top anglers by eligible catch weight</p>
          </div>
        </div>

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
            <p className="text-gray-400">No eligible catches logged in this period yet!</p>
          </div>
        )}

        {leaders.map((angler, i) => (
          <div key={angler.username} className={`bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-3 card-hover ${i === 0 ? 'border-yellow-500' : ''}`}>
            <div className="flex items-center gap-4">
              <span className="text-2xl">{medals[i] || `#${i + 1}`}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{angler.username}</span>
                  <span className="text-xs rounded-full bg-emerald-500/20 px-2 py-1 text-emerald-400">{angler.rank}</span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-400 mt-1">
                  <span>⚖️ {angler.totalWeight.toFixed(1)} lbs total</span>
                  <span>🎣 {angler.catchCount} catches</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-emerald-400 font-bold">{angler.xp} XP</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
