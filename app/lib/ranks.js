export const RANKS = [
  { name: 'Minnow', emoji: '🪱', minXp: 0 },
  { name: 'Bass', emoji: '🐟', minXp: 200 },
  { name: 'Tarpon', emoji: '🦈', minXp: 500 },
  { name: 'Legend', emoji: '👑', minXp: 1000 },
]

export function getRankFromXp(xp) {
  return [...RANKS].reverse().find(r => xp >= r.minXp) || RANKS[0]
}

export function getNextRank(xp) {
  const currentRank = getRankFromXp(xp)
  const currentIndex = RANKS.findIndex(r => r.name === currentRank.name)
  return RANKS[currentIndex + 1] || null
}

export function getRankProgress(xp) {
  const current = getRankFromXp(xp)
  const next = getNextRank(xp)
  if (!next) return 100
  return ((xp - current.minXp) / (next.minXp - current.minXp)) * 100
}