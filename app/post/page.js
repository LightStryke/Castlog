'use client'
import { SPECIES_DATA } from '../lib/species.js'

export default function PostPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white px-6 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8">
          <h1 className="text-3xl font-bold text-emerald-400 mb-3">Log a catch</h1>
          <p className="text-gray-400 mb-6">This page uses the shared species data from lib/species.js.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {SPECIES_DATA.slice(0, 6).map((species) => (
              <div key={species.name} className="bg-gray-950/40 border border-gray-800 rounded-2xl p-4">
                <p className="text-xl">{species.emoji} {species.name}</p>
                <p className="text-xs text-gray-400">{species.type} · WR {species.worldRecordLbs} lbs</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
