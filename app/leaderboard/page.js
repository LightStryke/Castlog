'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getRankFromXp } from '../lib/ranks.js'
import Avatar from '../components/Avatar'

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

      let query = supabase.from('catches').select('user_id, weight_lbs, profiles(username, rank, xp, avatar_url)').eq('leaderboard_eligible', true)

      if (dateFilter) {
        query = query.gte('created_at', dateFilter)
      }

      const { data } = await query

      const grouped = {}
      data?.forEach((catchItem) => {
        const uid = catchItem.user_id
        if (!grouped[uid]) {
          grouped[uid] = {
            username: catchItem.profiles?.username || 'Angler',
            rank: getRankFromXp(catchItem.profiles?.xp || 0).name,
            xp: catchItem.profiles?.xp || 0,
            avatar_url: catchItem.profiles?.avatar_url || null,
            totalWeight: 0,
            catchCount: 0,
          }
        }
        grouped[uid].totalWeight += parseFloat(catchItem.weight_lbs || 0)
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
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="gradient-text text-3xl font-bold">🏆 Leaderboard</h1>
            <p className="text-sm text-gray-400">Top anglers by eligible catch weight</p>
          </div>
        </div>

        <div className="mb-6 flex rounded-xl border border-gray-800 bg-gray-900 p-1">
          {['daily', 'weekly', 'alltime'].map((value) => (
            <button key={value} onClick={() => setTab(value)} className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${tab === value ? 'bg-emerald-500 text-black' : 'text-gray-400 hover:text-white'}`}>
              {value === 'daily' ? 'Today' : value === 'weekly' ? 'This week' : 'All time'}
            </button>
          ))}
        </div>

        {loading && <p className="text-center text-gray-400">Loading...</p>}

        {!loading && leaders.length === 0 && (
          <div className="py-20 text-center">
            <p className="mb-4 text-4xl">🎣</p>
            <p className="text-gray-400">No eligible catches logged in this period yet!</p>
          </div>
        )}

        {leaders.map((angler, index) => (
          <div key={angler.username} className={`card-hover mb-3 rounded-2xl border border-gray-800 bg-gray-900 p-5 ${index === 0 ? 'border-yellow-500' : ''}`}>
            <div className="flex items-center gap-4">
              <span className="text-2xl">{medals[index] || `#${index + 1}`}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Avatar user={{ username: angler.username, avatar_url: angler.avatar_url }} size={28} />
                  <span className="font-bold">{angler.username}</span>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs text-emerald-400">{angler.rank}</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-4 text-sm text-gray-400">
                  <span>⚖️ {angler.totalWeight.toFixed(1)} lbs total</span>
                  <span>🎣 {angler.catchCount} catches</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald-400">{angler.xp} XP</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
