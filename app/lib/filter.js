import { Filter } from 'bad-words'

const filter = new Filter()
filter.removeWords('bass', 'crappie')

export function cleanText(text) {
  if (!text) return text
  try {
    return filter.clean(text)
  } catch {
    return text
  }
}

export function containsProfanity(text) {
  if (!text) return false
  try {
    return filter.isProfane(text)
  } catch {
    return false
  }
}
