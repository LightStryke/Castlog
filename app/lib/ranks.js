export const RANKS = [
  { name: 'Minnow', emoji: '🪱', minXp: 0 },
  { name: 'Bluegill', emoji: '🐠', minXp: 100 },
  { name: 'Bass', emoji: '🐟', minXp: 300 },
  { name: 'Walleye', emoji: '🎣', minXp: 600 },
  { name: 'Pike', emoji: '🐊', minXp: 1000 },
  { name: 'Tarpon', emoji: '🦈', minXp: 1500 },
  { name: 'Marlin', emoji: '🦈', minXp: 2500 },
  { name: 'Swordfish', emoji: '🌊', minXp: 4000 },
  { name: 'Shark', emoji: '🦈', minXp: 6000 },
  { name: 'Legend', emoji: '👑', minXp: 10000 },
]

export function getRankFromXp(xp) {
  return [...RANKS].reverse().find((rank) => xp >= rank.minXp) || RANKS[0]
}

export function getNextRank(xp) {
  const current = getRankFromXp(xp)
  const currentIndex = RANKS.findIndex((rank) => rank.name === current.name)
  return RANKS[currentIndex + 1] || null
}

export function getRankProgress(xp) {
  const current = getRankFromXp(xp)
  const next = getNextRank(xp)
  if (!next) return 100
  return ((xp - current.minXp) / (next.minXp - current.minXp)) * 100
}

export function getBadgeForVotes(votes, hasPhoto) {
  if (votes >= 50) return { label: '⭐ Elite Catch', color: 'bg-amber-500/15 text-amber-300' }
  if (votes >= 30) return { label: '🏆 Community Verified', color: 'bg-emerald-500/15 text-emerald-300' }
  if (votes >= 10) return { label: '✅ Verified Catch', color: 'bg-sky-500/15 text-sky-300' }
  if (hasPhoto) return { label: '📸 Photo Verified', color: 'bg-emerald-500/15 text-emerald-300' }
  return null
}
