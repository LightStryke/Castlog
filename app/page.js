'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { RANKS } from './lib/ranks'

const steps = [
  { title: 'Log your catch 📸', copy: 'Capture your best fishing moments and log every detail in seconds.' },
  { title: 'Earn XP & rank up 🏆', copy: 'Climb the ladder and unlock badges as your profile grows.' },
  { title: 'Compete worldwide ⚔️', copy: 'Share your stories and compare against anglers around the globe.' },
]

export default function Home() {
  const [recentCatches, setRecentCatches] = useState([])

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('catches').select('*, profiles(username)').order('created_at', { ascending: false }).limit(3)
      setRecentCatches(data || [])
    }
    load()
  }, [])

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <section className="relative overflow-hidden px-6 py-20 md:px-10 lg:px-16">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.15) 0%, transparent 60%), #030712' }} />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-12">
          <div className="max-w-3xl">
            <h1 className="gradient-text text-6xl font-black leading-none md:text-8xl">CastLog</h1>
            <p className="mt-6 text-3xl font-bold text-white md:text-4xl">Fish. Post. Compete.</p>
            <p className="mt-4 max-w-2xl text-lg text-gray-300">The world&apos;s most competitive angling community.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/auth" className="btn-glow rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-black">Start fishing →</Link>
              <Link href="/leaderboard" className="rounded-xl border border-gray-700 px-6 py-3 font-semibold text-gray-200 transition hover:border-emerald-500 hover:text-white">See the leaderboard</Link>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="card-hover rounded-2xl border border-gray-800 bg-gray-900/80 p-6">
                <div className="mb-3 text-2xl">{index + 1}. {index === 0 ? '📸' : index === 1 ? '🏆' : '⚔️'}</div>
                <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm text-gray-400">{step.copy}</p>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-gray-800 bg-gray-900/80 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Live catches</h2>
              <Link href="/feed" className="text-sm text-emerald-400">Open feed</Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {recentCatches.map((catchItem) => (
                <div key={catchItem.id} className="card-hover rounded-2xl border border-gray-800 bg-gray-950/70 p-4">
                  <p className="text-lg font-semibold text-white">{catchItem.species}</p>
                  <p className="mt-1 text-sm text-gray-400">{catchItem.weight_lbs ? `${catchItem.weight_lbs} lbs` : 'Weight pending'}</p>
                  <p className="mt-2 text-sm text-emerald-400">{catchItem.profiles?.username || 'Angler'}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto pb-4">
            <div className="flex gap-3">
              {RANKS.map((rank) => (
                <span key={rank.name} className="rounded-full border border-gray-700 bg-gray-900/70 px-4 py-2 text-sm text-gray-300">{rank.emoji} {rank.name}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-800 px-6 py-6 text-center text-sm text-gray-500">
        Free forever · No domain needed · Built for anglers
      </footer>
    </main>
  )
}