'use client'
import { useMemo, useState } from 'react'
import { SPECIES_DATA } from '../lib/species.js'

const CATEGORY_MAP = {
  'Bluefin Tuna': 'Tuna & Billfish',
  'Yellowfin Tuna': 'Tuna & Billfish',
  'Bigeye Tuna': 'Tuna & Billfish',
  'Albacore': 'Tuna & Billfish',
  'Skipjack Tuna': 'Tuna & Billfish',
  'Blackfin Tuna': 'Tuna & Billfish',
  'Swordfish': 'Tuna & Billfish',
  'Blue Marlin': 'Tuna & Billfish',
  'White Marlin': 'Tuna & Billfish',
  'Sailfish': 'Tuna & Billfish',
  'Spearfish': 'Tuna & Billfish',
  'Red Snapper': 'Snapper & Grouper',
  'Mangrove Snapper': 'Snapper & Grouper',
  'Mutton Snapper': 'Snapper & Grouper',
  'Lane Snapper': 'Snapper & Grouper',
  'Yellowtail Snapper': 'Snapper & Grouper',
  'Gag Grouper': 'Snapper & Grouper',
  'Red Grouper': 'Snapper & Grouper',
  'Black Grouper': 'Snapper & Grouper',
  'Warsaw Grouper': 'Snapper & Grouper',
  'Goliath Grouper': 'Snapper & Grouper',
  'Great White Shark': 'Sharks',
  'Tiger Shark': 'Sharks',
  'Bull Shark': 'Sharks',
  'Hammerhead Shark': 'Sharks',
  'Blacktip Shark': 'Sharks',
  'Spinner Shark': 'Sharks',
  'Lemon Shark': 'Sharks',
  'Sandbar Shark': 'Sharks',
  'Nurse Shark': 'Sharks',
  'Shortfin Mako Shark': 'Sharks',
  'Blue Shark': 'Sharks',
  'Thresher Shark': 'Sharks',
  'Porbeagle': 'Sharks',
  'Dogfish': 'Sharks',
}

const groups = ['Freshwater', 'Saltwater', 'Tuna & Billfish', 'Snapper & Grouper', 'Sharks']

const getGroupForSpecies = (item) => {
  if (CATEGORY_MAP[item.name]) return CATEGORY_MAP[item.name]
  if (item.type === 'Freshwater') return 'Freshwater'
  if (item.type === 'Saltwater' || item.type === 'Both') return 'Saltwater'
  return 'Saltwater'
}

export default function PostPage() {
  const [search, setSearch] = useState('')
  const [species, setSpecies] = useState('')
  const [weight, setWeight] = useState('')
  const [length, setLength] = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')

  const filteredSpecies = useMemo(() => {
    const term = search.trim().toLowerCase()
    return SPECIES_DATA.filter((item) => item.name.toLowerCase().includes(term))
  }, [search])

  const groupedOptions = useMemo(() => {
    return groups.reduce((acc, group) => {
      acc[group] = []
      return acc
    }, {})
  }, [])

  const speciesByGroup = useMemo(() => {
    const result = groups.reduce((acc, group) => ({ ...acc, [group]: [] }), {})
    filteredSpecies.forEach((item) => {
      const group = getGroupForSpecies(item)
      result[group]?.push(item)
    })
    return result
  }, [filteredSpecies])

  return (
    <main className="min-h-screen bg-gray-950 text-white px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 card-hover">
          <h1 className="text-3xl font-bold text-emerald-400 mb-4">Log a catch</h1>
          <p className="text-gray-400 mb-6">Search and select the exact species, then add catch details.</p>

          <div className="space-y-6">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Search species</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type to filter species"
                className="w-full bg-gray-800 border border-gray-700 focus:border-emerald-500 rounded-lg px-4 py-3 text-white placeholder-gray-500"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Species</label>
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 focus:border-emerald-500 rounded-lg px-4 py-3 text-white"
              >
                <option value="">Select species</option>
                {groups.map((group) => (
                  <optgroup key={group} label={group}>
                    {speciesByGroup[group].length > 0 ? (
                      speciesByGroup[group].map((item) => (
                        <option key={item.name} value={item.name}>
                          {item.emoji} {item.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No matches</option>
                    )}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Weight (lbs)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g. 7.5"
                  className="w-full bg-gray-800 border border-gray-700 focus:border-emerald-500 rounded-lg px-4 py-3 text-white placeholder-gray-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Length (inches)</label>
                <input
                  type="number"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  placeholder="e.g. 18"
                  className="w-full bg-gray-800 border border-gray-700 focus:border-emerald-500 rounded-lg px-4 py-3 text-white placeholder-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Lake, river, beach, etc."
                className="w-full bg-gray-800 border border-gray-700 focus:border-emerald-500 rounded-lg px-4 py-3 text-white placeholder-gray-500"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="4"
                placeholder="Tell the story behind your catch"
                className="w-full bg-gray-800 border border-gray-700 focus:border-emerald-500 rounded-lg px-4 py-3 text-white placeholder-gray-500"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-400">
                Selected: <span className="text-white">{species || 'None'}</span>
              </div>
              <button
                className="btn-glow bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl px-6 py-3"
                disabled={!species}
              >
                Save catch
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
