'use client'

import { useEffect, useState } from 'react'
import { ACHIEVEMENTS } from '../lib/achievements'

export default function AchievementToast({ achievements, onDone }) {
  const [visible, setVisible] = useState(Boolean(achievements?.length))

  useEffect(() => {
    if (!achievements?.length) return
    const timer = window.setTimeout(() => {
      setVisible(false)
      window.setTimeout(() => onDone?.(), 300)
    }, 4000)
    return () => window.clearTimeout(timer)
  }, [achievements, onDone])

  if (!visible || !achievements?.length) return null

  const firstKey = achievements[0]
  const first = ACHIEVEMENTS.find((item) => item.key === firstKey)
  if (!first) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 transition-all duration-300">
      <div className="rounded-2xl border border-emerald-500/40 bg-gray-950/95 px-4 py-3 shadow-2xl shadow-emerald-500/20">
        <p className="text-sm font-semibold text-emerald-400">🎯 Achievement Unlocked!</p>
        <p className="text-sm text-white">{first.title} — +{first.xpBonus} XP</p>
      </div>
    </div>
  )
}
