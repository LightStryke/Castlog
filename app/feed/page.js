'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import { TIPS } from '../lib/tips'
import Avatar from '../components/Avatar'
import { checkAndAwardAchievements } from '../lib/checkAchievements'
import AchievementToast from '../components/AchievementToast'
import { cleanText } from '../lib/filter'

export default function Feed() {
  const [catches, setCatches] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('everyone')
  const [followedIds, setFollowedIds] = useState([])
  const [votedIds, setVotedIds] = useState([])
  const [expandedThreads, setExpandedThreads] = useState({})
  const [commentsByCatch, setCommentsByCatch] = useState({})
  const [commentDrafts, setCommentDrafts] = useState({})
  const [commentLoading, setCommentLoading] = useState({})
  const [commentCounts, setCommentCounts] = useState({})
  const [toastAchievements, setToastAchievements] = useState([])

  const tipIndex = useMemo(() => Math.floor(Date.now() / 86400000) % TIPS.length, [])

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const currentUser = userData.user
      setUser(currentUser)

      const { data: catchesData } = await supabase
        .from('catches')
        .select('*, profiles(username, rank, xp, avatar_url)')
        .order('created_at', { ascending: false })

      setCatches(catchesData || [])

      if (currentUser) {
        const { data: followsData } = await supabase.from('follows').select('following_id').eq('follower_id', currentUser.id)
        setFollowedIds((followsData || []).map((item) => item.following_id))
      }

      const { data: commentsData } = await supabase.from('comments').select('catch_id')
      const counts = {}
      commentsData?.forEach((comment) => {
        counts[comment.catch_id] = (counts[comment.catch_id] || 0) + 1
      })
      setCommentCounts(counts)
      setLoading(false)
    }
    load()
  }, [])

  const handleVote = async (catchId) => {
    if (!user || votedIds.includes(catchId)) return
    const target = catches.find((item) => item.id === catchId)
    if (!target) return

    await supabase.from('catch_votes').insert({ catch_id: catchId, user_id: user.id })
    await supabase.from('catches').update({ votes: (target.votes || 0) + 1 }).eq('id', catchId)
    setCatches((items) => items.map((item) => (item.id === catchId ? { ...item, votes: (item.votes || 0) + 1 } : item)))
    setVotedIds((items) => [...items, catchId])
  }

  const toggleFollow = async (targetId) => {
    if (!user) return
    if (followedIds.includes(targetId)) {
      await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', targetId)
      setFollowedIds((items) => items.filter((item) => item !== targetId))
      return
    }

    await supabase.from('follows').insert({ follower_id: user.id, following_id: targetId })
    setFollowedIds((items) => [...items, targetId])
  }

  const toggleComments = async (catchId) => {
    if (expandedThreads[catchId]) {
      setExpandedThreads((items) => ({ ...items, [catchId]: false }))
      return
    }

    if (commentsByCatch[catchId]) {
      setExpandedThreads((items) => ({ ...items, [catchId]: true }))
      return
    }

    setCommentLoading((items) => ({ ...items, [catchId]: true }))
    const { data } = await supabase.from('comments').select('*, profiles(username, avatar_url)').eq('catch_id', catchId).order('created_at', { ascending: false })
    setCommentsByCatch((items) => ({ ...items, [catchId]: data || [] }))
    setExpandedThreads((items) => ({ ...items, [catchId]: true }))
    setCommentLoading((items) => ({ ...items, [catchId]: false }))
  }

  const handleCommentSubmit = async (catchId) => {
    if (!user) return
    const content = (commentDrafts[catchId] || '').trim()
    if (!content) return
    const cleaned = cleanText(content)
    const { error } = await supabase.from('comments').insert({ catch_id: catchId, user_id: user.id, content: cleaned })
    if (error) return

    const newComment = {
      id: `${catchId}-${Date.now()}`,
      content: cleaned,
      created_at: new Date().toISOString(),
      profiles: { username: user.email?.split('@')[0] || 'Angler', avatar_url: null },
    }

    setCommentsByCatch((items) => ({ ...items, [catchId]: [newComment, ...(items[catchId] || [])] }))
    setCommentDrafts((items) => ({ ...items, [catchId]: '' }))
    setCommentCounts((items) => ({ ...items, [catchId]: (items[catchId] || 0) + 1 }))
    const unlocked = await checkAndAwardAchievements(user.id, supabase)
    if (unlocked.length) setToastAchievements(unlocked)
  }

  const visibleCatches = tab === 'following' ? catches.filter((item) => followedIds.includes(item.user_id)) : catches

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <AchievementToast achievements={toastAchievements} onDone={() => setToastAchievements([])} />
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-6 rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 p-4">
          <p className="text-sm font-semibold text-emerald-400">Tip of the Day 🎣</p>
          <p className="mt-2 text-sm text-gray-300">{TIPS[tipIndex]}</p>
          <p className="mt-3 text-xs uppercase tracking-[0.3em] text-gray-500">Day {tipIndex + 1}</p>
        </div>

        <div className="mb-6 flex rounded-xl border border-gray-800 bg-gray-900 p-1">
          {['everyone', 'following'].map((value) => (
            <button key={value} onClick={() => setTab(value)} className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${tab === value ? 'bg-emerald-500 text-black' : 'text-gray-400'}`}>
              {value === 'everyone' ? '🌎 Everyone' : '👥 Following'}
            </button>
          ))}
        </div>

        {loading && <p className="text-center text-gray-400">Loading catches...</p>}

        {!loading && visibleCatches.length === 0 && (
          <div className="rounded-3xl border border-gray-800 bg-gray-900/70 p-8 text-center">
            <p className="mb-4 text-4xl">🎣</p>
            <p className="text-gray-400">{tab === 'following' ? "You're not following any anglers yet. Discover anglers in the Leaderboard and follow them!" : 'No catches yet — be the first to post one!'}</p>
            <Link href="/post" className="mt-4 inline-block rounded-xl bg-emerald-500 px-6 py-3 font-bold text-black">Post your first catch</Link>
          </div>
        )}

        {visibleCatches.map((catchItem) => {
          const isFollowing = followedIds.includes(catchItem.user_id)
          const isOwnCatch = user?.id === catchItem.user_id
          const isExpanded = !!expandedThreads[catchItem.id]
          return (
            <div key={catchItem.id} className="card-hover mb-4 rounded-2xl border border-gray-800 bg-gray-900 p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar user={catchItem.profiles} size={36} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{catchItem.profiles?.username || 'Angler'}</span>
                      <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-semibold text-emerald-400">{catchItem.profiles?.rank || 'Minnow'}</span>
                    </div>
                    {!isOwnCatch && (
                      <button onClick={() => toggleFollow(catchItem.user_id)} className={`mt-1 text-xs font-semibold ${isFollowing ? 'text-emerald-400' : 'text-gray-400'}`}>
                        {isFollowing ? 'Following ✓' : 'Follow'}
                      </button>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-500">{new Date(catchItem.created_at).toLocaleDateString()}</span>
              </div>

              {catchItem.image_url ? <img src={catchItem.image_url} alt={catchItem.species} className="mb-3 max-h-64 w-full rounded-xl object-cover" /> : null}

              <h3 className="mb-2 text-xl font-bold text-white">{catchItem.species}</h3>
              <div className="mb-3 flex flex-wrap gap-4 text-sm text-gray-400">
                {catchItem.weight_lbs ? <span>⚖️ {catchItem.weight_lbs} lbs</span> : null}
                {catchItem.length_inches ? <span>📏 {catchItem.length_inches}"</span> : null}
                {catchItem.location ? <span>📍 {catchItem.location}</span> : null}
              </div>
              {catchItem.notes ? <p className="mb-3 text-sm text-gray-300">{catchItem.notes}</p> : null}

              <div className="mb-3 flex flex-wrap gap-2">
                {catchItem.leaderboard_eligible ? <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-400">Verified</span> : null}
                {catchItem.flagged ? <span className="rounded-full bg-amber-500/10 px-2 py-1 text-xs text-amber-400">Needs review</span> : null}
              </div>

              <div className="flex flex-wrap gap-3">
                <button onClick={() => handleVote(catchItem.id)} className={`rounded-lg px-4 py-2 text-sm font-semibold ${votedIds.includes(catchItem.id) ? 'bg-emerald-500 text-black' : 'bg-gray-800 text-gray-200'}`}>
                  👍 {catchItem.votes || 0} votes
                </button>
                <button onClick={() => toggleComments(catchItem.id)} className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-200">
                  💬 {commentCounts[catchItem.id] || 0} comments
                </button>
              </div>

              {isExpanded ? (
                <div className="mt-4 rounded-2xl border border-gray-800 bg-gray-950/80 p-3">
                  {commentLoading[catchItem.id] ? <p className="text-sm text-gray-400">Loading comments...</p> : null}
                  {!commentLoading[catchItem.id] && (commentsByCatch[catchItem.id] || []).length === 0 ? <p className="text-sm text-gray-500">No comments yet.</p> : null}
                  {(commentsByCatch[catchItem.id] || []).map((comment) => (
                    <div key={comment.id} className="mb-3 flex gap-3 border-b border-gray-800 pb-3 last:border-b-0 last:pb-0">
                      <Avatar user={comment.profiles} size={28} />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-white">{comment.profiles?.username || 'Angler'}</p>
                          <p className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleString()}</p>
                        </div>
                        <p className="text-sm text-gray-300">{comment.content}</p>
                      </div>
                    </div>
                  ))}

                  <div className="mt-3 flex gap-2">
                    <input value={commentDrafts[catchItem.id] || ''} onChange={(event) => setCommentDrafts((items) => ({ ...items, [catchItem.id]: event.target.value }))} maxLength={280} placeholder="Add a comment" className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white" />
                    <button onClick={() => handleCommentSubmit(catchItem.id)} className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black">Post</button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">{(commentDrafts[catchItem.id] || '').length}/280</p>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </main>
  )
}
