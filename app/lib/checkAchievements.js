import { ACHIEVEMENTS } from './achievements'

export async function checkAndAwardAchievements(userId, supabase) {
  if (!userId || !supabase) return []

  const [{ data: catches }, { data: profile }, { data: comments }, { data: existingAchievements }] = await Promise.all([
    supabase.from('catches').select('*').eq('user_id', userId),
    supabase.from('profiles').select('xp').eq('id', userId).single(),
    supabase.from('comments').select('id').eq('user_id', userId),
    supabase.from('achievements').select('achievement_key').eq('user_id', userId),
  ])

  const unlocked = []
  const existingKeys = new Set((existingAchievements || []).map((a) => a.achievement_key))
  const speciesSet = new Set((catches || []).map((catchItem) => catchItem.species).filter(Boolean))
  const saltwaterSpecies = (catches || []).filter((catchItem) => catchItem.species?.toLowerCase().includes('shark') || catchItem.species?.toLowerCase().includes('tuna') || catchItem.species?.toLowerCase().includes('marlin') || catchItem.species?.toLowerCase().includes('salmon') || catchItem.species?.toLowerCase().includes('drum') || catchItem.species?.toLowerCase().includes('tarpon'))
  const freshwaterSpecies = (catches || []).filter((catchItem) => !catchItem.species?.toLowerCase().includes('shark') && !catchItem.species?.toLowerCase().includes('tuna') && !catchItem.species?.toLowerCase().includes('marlin') && !catchItem.species?.toLowerCase().includes('salmon') && !catchItem.species?.toLowerCase().includes('drum') && !catchItem.species?.toLowerCase().includes('tarpon'))

  for (const achievement of ACHIEVEMENTS) {
    if (existingKeys.has(achievement.key)) continue

    let qualifies = false
    switch (achievement.key) {
      case 'first_cast':
        qualifies = (catches || []).length >= 1
        break
      case 'shark_hunter':
        qualifies = (catches || []).some((catchItem) => catchItem.species?.toLowerCase().includes('shark'))
        break
      case 'week_warrior':
        qualifies = (catches || []).length >= 7
        break
      case 'fan_favourite':
        qualifies = (catches || []).reduce((sum, catchItem) => sum + (catchItem.votes || 0), 0) >= 50
        break
      case 'ocean_explorer':
        qualifies = saltwaterSpecies.length >= 5
        break
      case 'freshwater_master':
        qualifies = freshwaterSpecies.length >= 10
        break
      case 'big_fish':
        qualifies = (catches || []).some((catchItem) => Number(catchItem.weight_lbs) > 50)
        break
      case 'legend_status':
        qualifies = (profile?.xp || 0) >= 10000
        break
      case 'community_star':
        qualifies = (comments || []).length >= 20
        break
      case 'species_collector':
        qualifies = speciesSet.size >= 25
        break
      default:
        qualifies = false
    }

    if (qualifies) {
      await supabase.from('achievements').insert({ user_id: userId, achievement_key: achievement.key })
      await supabase.from('profiles').update({ xp: (profile?.xp || 0) + achievement.xpBonus }).eq('id', userId)
      unlocked.push(achievement.key)
    }
  }

  return unlocked
}
