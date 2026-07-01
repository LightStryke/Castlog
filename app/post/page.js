'use client'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { SPECIES_DATA } from '../lib/species.js'
import { cleanText, containsProfanity } from '../lib/filter'
import { checkAndAwardAchievements } from '../lib/checkAchievements'
import AchievementToast from '../components/AchievementToast'
import { getRankFromXp } from '../lib/ranks.js'

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
  const [user, setUser] = useState(null)
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [warning, setWarning] = useState('')
  const [toastAchievements, setToastAchievements] = useState([])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = '/auth'
        return
      }
      setUser(data.user)
    })
  }, [])

  const filteredSpecies = useMemo(() => {
    const term = search.trim().toLowerCase()
    return SPECIES_DATA.filter((item) => item.name.toLowerCase().includes(term))
  }, [search])

  const speciesByGroup = useMemo(() => {
    const result = groups.reduce((acc, group) => ({ ...acc, [group]: [] }), {})
    filteredSpecies.forEach((item) => {
      const group = getGroupForSpecies(item)
      result[group]?.push(item)
    })
    return result
  }, [filteredSpecies])

  const handleSpeciesSelect = (value) => {
    setSpecies(value)
    const selected = SPECIES_DATA.find((item) => item.name === value)
    if (selected) setSearch(selected.name)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!species || !user) {
      setMessage('Please select a species')
      return
    }

    setLoading(true)
    setMessage('')
    setWarning('')

    const cleanedLocation = cleanText(location)
    const cleanedNotes = cleanText(notes)
    const profanityFlag = containsProfanity(location) || containsProfanity(notes)

    const { data: existingProfile } = await supabase.from('profiles').select('id').eq('id', user.id).single()
    if (!existingProfile) {
      await supabase.from('profiles').insert({
        id: user.id,
        username: user.email?.split('@')[0] || 'angler',
        xp: 0,
        rank: 'Minnow',
        reputation: 0,
      })
    }

    let image_url = null
    if (image) {
      const fileExt = image.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('catches').upload(fileName, image)
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('catches').getPublicUrl(fileName)
        image_url = urlData.publicUrl
      }
    }

    const speciesInfo = SPECIES_DATA.find((item) => item.name === species)
    const beatsRecord = speciesInfo && weight && parseFloat(weight) > speciesInfo.worldRecordLbs
    const leaderboard_eligible = !!image_url && !beatsRecord

    const { error } = await supabase.from('catches').insert({
      user_id: user.id,
      species,
      weight_lbs: weight ? parseFloat(weight) : null,
      length_inches: length ? parseFloat(length) : null,
      location: cleanedLocation || null,
      notes: cleanedNotes || null,
      image_url,
      votes: 0,
      leaderboard_eligible,
      flagged: beatsRecord || false,
      status: 'active',
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    const xpEarned = image_url ? 150 : 30
    const { data: profile } = await supabase.from('profiles').select('xp').eq('id', user.id).single()
    const newXp = (profile?.xp || 0) + xpEarned
    const newRank = getRankFromXp(newXp).name
    await supabase.from('profiles').update({ xp: newXp, rank: newRank }).eq('id', user.id)

    const unlocked = await checkAndAwardAchievements(user.id, supabase)
    if (unlocked.length) {
      setToastAchievements(unlocked)
    }

    if (beatsRecord) setWarning('This claimed weight exceeds the known world record for that species.')
    if (profanityFlag) setMessage('Your text was auto-cleaned for community standards 🎣')
    window.location.href = '/feed'
  }

  return (
    <main className="min-h-screen bg-gray-950 px-4 py-8 text-white">
      <AchievementToast achievements={toastAchievements} onDone={() => setToastAchievements([])} />
      <div className="mx-auto max-w-3xl">
        <div className="card-hover rounded-3xl border border-gray-800 bg-gray-900 p-8">
          <h1 className="gradient-text mb-4 text-3xl font-bold">Log a catch</h1>
          <p className="mb-6 text-gray-400">Search and select the exact species, then add catch details.</p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm text-gray-400">Search & select species</label>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Type to filter species"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-400">Species</label>
              <select
                value={species}
                onChange={(event) => handleSpeciesSelect(event.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:border-emerald-500"
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
                <label className="mb-2 block text-sm text-gray-400">Weight (lbs)</label>
                <input type="number" value={weight} onChange={(event) => setWeight(event.target.value)} placeholder="e.g. 7.5" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-gray-400">Length (inches)</label>
                <input type="number" value={length} onChange={(event) => setLength(event.target.value)} placeholder="e.g. 18" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500" />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-400">Location</label>
              <input type="text" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Lake, river, beach, etc." className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500" />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-400">Notes</label>
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows="4" placeholder="Tell the story behind your catch" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500" />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-400">Photo</label>
              <input type="file" accept="image/*" capture="environment" onChange={(event) => setImage(event.target.files?.[0] || null)} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-gray-300" />
            </div>

            {warning ? <p className="text-sm text-amber-400">{warning}</p> : null}
            {message ? <p className="text-sm text-emerald-400">{message}</p> : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-400">
                Selected: <span className="text-white">{species || 'None'}</span>
              </div>
              <button type="submit" className="btn-glow rounded-xl bg-emerald-500 px-6 py-3 font-bold text-black" disabled={loading || !species}>
                {loading ? 'Saving...' : 'Save catch'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
