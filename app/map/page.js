'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { supabase } from '../lib/supabase'

const Map = dynamic(() => import('../components/MapView'), { ssr: false })

export default function MapPage() {
  const [catches, setCatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('catches')
        .select('*, profiles(username, rank)')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
      setCatches(data || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="relative">
        <div className="absolute left-4 top-4 z-[1000] rounded-xl border border-gray-800 bg-gray-950/90 px-3 py-2 shadow-lg">
          <label className="text-xs uppercase tracking-wide text-gray-400">Filter</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white">
            <option>All</option>
            <option>Freshwater</option>
            <option>Saltwater</option>
            <option>Sharks</option>
          </select>
        </div>
        {loading ? <div className="flex h-[calc(100vh-64px)] items-center justify-center text-gray-400">Loading map...</div> : <Map catches={catches} filter={filter} />}
      </div>
    </main>
  )
}
