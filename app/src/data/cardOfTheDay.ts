import type { TarotCard } from '../types/tarotCard'

export function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0
  }
  return hash >>> 0
}

// Deterministic theo ngày: cùng 1 dateKey → cùng 1 lá cho mọi user.
export function getDailyCard(dateKey: string, cards: readonly TarotCard[]): TarotCard {
  if (cards.length === 0) {
    throw new Error('Cannot select a daily card from an empty deck')
  }
  const index = hashCode(dateKey) % cards.length
  return cards[index]
}

export function getCardOfTheDay(cards: readonly TarotCard[], date: Date = new Date()): TarotCard {
  return getDailyCard(toDateKey(date), cards)
}
