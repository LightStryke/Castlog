'use client'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { RANKS, getRankFromXp, getNextRank, getRankProgress } from '../lib/ranks.js'
import { ACHIEVEMENTS } from '../lib/achievements'
import Avatar from '../components/Avatar'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [catches, setCatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [achievements, setAchievements] = useState([])
  const fileInputRef = useRef(null)

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return window.location.href = '/auth'

      const userId = userData.user.id
      const [{ data: profileData }, { data: catchData }, { data: followerData }, { data: followingData }, { data: achievementData }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('catches').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('follows').select('id').eq('following_id', userId),
        supabase.from('follows').select('id').eq('follower_id', userId),
        supabase.from('achievements').select('*').eq('user_id', userId),
      ])

      setProfile(profileData)
      setCatches(catchData || [])
      setFollowerCount(followerData?.length || 0)
      setFollowingCount(followingData?.length || 0)
      setAchievements(achievementData || [])
      setLoading(false)
    }
    load()
  }, [])

  const handleAvatarSelect = async (event) => {
    const file = event.target.files?.[0]
    if (!file || !profile?.id) return
    setUploading(true)
    const ext = file.name.split('.').pop() || 'png'
    const path = `${profile.id}/avatar.${ext}`
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (!uploadError) {
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
      await supabase.from('profiles').update({ avatar_url: urlData.publicUrl }).eq('id', profile.id)
      setProfile((current) => ({ ...current, avatar_url: urlData.publicUrl }))
    }
    setUploading(false)
    event.target.value = ''
  }

  if (loading) return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
      <p className="text-gray-400">Loading...</p>
    </main>
  )

  const rankData = getRankFromXp(profile?.xp || 0)
  const current = rankData
  const next = getNextRank(profile?.xp || 0)
  const progress = getRankProgress(profile?.xp || 0)
  const totalVotes = catches.reduce((sum, catchItem) => sum + (catchItem.votes || 0), 0)
  const unlockedKeys = new Set(achievements.map((item) => item.achievement_key))

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="card-hover mb-6 rounded-2xl border border-gray-800 bg-gray-900 p-6">
          <div className="mb-6 flex items-center gap-4">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-emerald-500/30 bg-emerald-600 text-2xl font-bold text-black">
              {profile?.avatar_url ? <img src={profile.avatar_url} alt={profile.username} className="h-full w-full object-cover" /> : <span className="flex h-full w-full items-center justify-center">{profile?.username?.[0]?.toUpperCase()}</span>}
              {uploading ? <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm text-white">...</span> : <span className="absolute bottom-0 right-0 rounded-full bg-gray-950 px-1 text-sm">📷</span>}
            </button>
            <input ref={fileInputRef} hidden type="file" accept="image/*" onChange={handleAvatarSelect} />
            <div>
              <h2 className="text-xl font-bold">{profile?.username}</h2>
              <p className="text-emerald-400">{current?.emoji} {current?.name}</p>
              <p className="text-sm text-gray-400">{followerCount} followers · {followingCount} following</p>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-gray-800 p-3 text-center">
              <p className="text-2xl font-bold text-emerald-400">{catches.length}</p>
              <p className="mt-1 text-xs text-gray-400">Catches</p>
            </div>
            <div className="rounded-xl bg-gray-800 p-3 text-center">
              <p className="text-2xl font-bold text-emerald-400">{profile?.xp || 0}</p>
              <p className="mt-1 text-xs text-gray-400">XP</p>
            </div>
            <div className="rounded-xl bg-gray-800 p-3 text-center">
              <p className="text-2xl font-bold text-emerald-400">{totalVotes}</p>
              <p className="mt-1 text-xs text-gray-400">Votes</p>
            </div>
          </div>

          <div>
            <div className="mb-1 flex justify-between text-xs text-gray-400">
              <span>{current?.emoji} {current?.name}</span>
              {next ? <span>{next?.emoji} {next?.name} at {next?.minXp} XP</span> : <span>👑 Max rank reached!</span>}
            </div>
            <div className="h-3 rounded-full bg-gray-800">
              <div className="h-3 rounded-full bg-emerald-500 transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
            <p className="mt-1 text-right text-xs text-gray-400">{profile?.xp || 0} XP</p>
          </div>
        </div>

        <div className="card-hover mb-6 rounded-2xl border border-gray-800 bg-gray-900 p-5">
          <h3 className="mb-4 font-semibold">Achievements</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {ACHIEVEMENTS.map((achievement) => {
              const unlocked = unlockedKeys.has(achievement.key)
              return (
                <div key={achievement.key} className={`rounded-xl border p-4 ${unlocked ? 'border-emerald-500/30 bg-emerald-500/10 badge-unlocked' : 'border-gray-800 bg-gray-950 badge-locked'}`}>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{achievement.emoji}</div>
                    <div>
                      <p className={`font-semibold ${unlocked ? 'text-white' : 'text-gray-500'}`}>{unlocked ? achievement.title : '???'}</p>
                      <p className={`text-sm ${unlocked ? 'text-gray-300' : 'text-gray-600'}`}>{unlocked ? achievement.description : 'Locked achievement'}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="card-hover rounded-2xl border border-gray-800 bg-gray-900 p-5">
          <h3 className="mb-4 font-semibold">Rank ladder</h3>
          <div className="flex flex-col gap-2">
            {RANKS.map((rank) => (
              <div key={rank.name} className={`flex items-center justify-between rounded-lg px-4 py-2 ${current?.name === rank.name ? 'bg-emerald-500 text-black' : 'bg-gray-800 text-gray-400'}`}>
                <span className="font-semibold">{rank.emoji} {rank.name}</span>
                <span className="text-sm">{rank.minXp} XP</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="mb-4 font-semibold">My catches</h3>
          {catches.length === 0 && <p className="py-8 text-center text-sm text-gray-400">No catches yet — go fish!</p>}
          {catches.map((catchItem) => (
            <div key={catchItem.id} className="card-hover mb-3 rounded-xl border border-gray-800 bg-gray-900 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{catchItem.species}</p>
                  <p className="text-sm text-gray-400">{catchItem.weight_lbs ? `${catchItem.weight_lbs} lbs` : ''}{catchItem.location ? ` · ${catchItem.location}` : ''}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-emerald-400">👍 {catchItem.votes}</p>
                  <p className="text-xs text-gray-500">{new Date(catchItem.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
