'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { RANKS, getRankFromXp, getNextRank, getRankProgress } from '../lib/ranks.js'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [catches, setCatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return window.location.href = '/auth'

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.user.id)
        .single()

      const { data: catchData } = await supabase
        .from('catches')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false })

      setProfile(profileData)
      setCatches(catchData || [])
      setLoading(false)
    }
    load()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/auth'
  }

  if (loading) return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <p className="text-gray-400">Loading...</p>
    </main>
  )

  const { current, next, progress } = getRankFromXp(profile?.xp || 0) ? { current: getRankFromXp(profile?.xp || 0), next: getNextRank(profile?.xp || 0), progress: getRankProgress(profile?.xp || 0) } : {}
  const totalVotes = catches.reduce((sum, c) => sum + (c.votes || 0), 0)

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6 card-hover">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-2xl font-bold text-black">
              {profile?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold">{profile?.username}</h2>
              <p className="text-emerald-400">{current?.emoji} {current?.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-emerald-400">{catches.length}</p>
              <p className="text-xs text-gray-400 mt-1">Catches</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-emerald-400">{profile?.xp || 0}</p>
              <p className="text-xs text-gray-400 mt-1">XP</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-emerald-400">{totalVotes}</p>
              <p className="text-xs text-gray-400 mt-1">Votes</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{current?.emoji} {current?.name}</span>
              {next ? <span>{next?.emoji} {next?.name} at {next?.minXp} XP</span> : <span>👑 Max rank reached!</span>}
            </div>
            <div className="bg-gray-800 rounded-full h-3">
              <div
                className="bg-emerald-500 h-3 rounded-full transition-all"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1 text-right">{profile?.xp || 0} XP</p>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6 card-hover">
          <h3 className="font-semibold mb-4">Rank ladder</h3>
          <div className="flex flex-col gap-2">
            {RANKS.map((rank) => (
              <div key={rank.name} className={`flex items-center justify-between px-4 py-2 rounded-lg ${current?.name === rank.name ? 'bg-emerald-500 text-black' : 'bg-gray-800 text-gray-400'}`}>
                <span className="font-semibold">{rank.emoji} {rank.name}</span>
                <span className="text-sm">{rank.minXp} XP</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-4">My catches</h3>
          {catches.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-8">No catches yet — go fish!</p>
          )}
          {catches.map((c) => (
            <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-3 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{c.species}</p>
                  <p className="text-sm text-gray-400">
                    {c.weight_lbs && `${c.weight_lbs} lbs`}
                    {c.location && ` · ${c.location}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 text-sm">👍 {c.votes}</p>
                  <p className="text-xs text-gray-500">{new Date(c.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
