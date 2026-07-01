'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Feed() {
  const [catches, setCatches] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }
    const getCatches = async () => {
      const { data } = await supabase
        .from('catches')
        .select('*, profiles(username, rank)')
        .order('created_at', { ascending: false })
      setCatches(data || [])
      setLoading(false)
    }
    getUser()
    getCatches()
  }, [])

  const handleVote = async (catchId) => {
    if (!user) return
    await supabase.from('catch_votes').insert({ catch_id: catchId, user_id: user.id })
    await supabase.from('catches').update({ votes: catches.find(c => c.id === catchId).votes + 1 }).eq('id', catchId)
    setCatches(catches.map(c => c.id === catchId ? { ...c, votes: c.votes + 1 } : c))
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-xl font-bold text-emerald-400">🎣 CastLog</h1>
        <div className="flex gap-3">
          <a href="/post" className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-4 py-2 rounded-lg text-sm">
            + Post catch
          </a>
          <a href="/profile" className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm">
            Profile
          </a>
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-lg mx-auto px-4 py-6">
        {loading && <p className="text-gray-400 text-center">Loading catches...</p>}

        {!loading && catches.length === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🎣</p>
            <p className="text-gray-400">No catches yet — be the first to post one!</p>
            <a href="/post" className="mt-4 inline-block bg-emerald-500 text-black font-bold px-6 py-3 rounded-xl">
              Post your first catch
            </a>
          </div>
        )}

        {catches.map((c) => (
          <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="font-semibold text-sm">{c.profiles?.username || 'Angler'}</span>
                <span className="text-xs text-emerald-400 ml-2">{c.profiles?.rank || 'Minnow'}</span>
              </div>
              <span className="text-xs text-gray-500">{new Date(c.created_at).toLocaleDateString()}</span>
            </div>

            {c.image_url && (
              <img src={c.image_url} alt={c.species} className="w-full rounded-xl mb-3 object-cover max-h-64" />
            )}

            <h3 className="text-lg font-bold mb-1">{c.species}</h3>
            <div className="flex gap-4 text-sm text-gray-400 mb-3">
              {c.weight_lbs && <span>⚖️ {c.weight_lbs} lbs</span>}
              {c.length_inches && <span>📏 {c.length_inches}"</span>}
              {c.location && <span>📍 {c.location}</span>}
            </div>
            {c.notes && <p className="text-gray-300 text-sm mb-3">{c.notes}</p>}

            <button
              onClick={() => handleVote(c.id)}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm"
            >
              👍 {c.votes} votes
            </button>
          </div>
        ))}
      </div>

    </main>
  )
}