import type { TarotCard, TarotSuit, YesNoAnswer } from '../types/tarotCard'

export type DailyFortuneAspect = 'finance' | 'love' | 'career'

export interface DailyFortuneItem {
  aspect: DailyFortuneAspect
  score: number
}

const BASE_SCORE: Record<YesNoAnswer, number> = {
  yes: 4,
  maybe: 3,
  uncertain: 2,
  no: 2
}

const SUIT_AFFINITY: Record<TarotSuit, Record<DailyFortuneAspect, number>> = {
  wands: { finance: 0, love: 0, career: 1 },
  cups: { finance: -1, love: 1, career: 0 },
  swords: { finance: 0, love: -1, career: 1 },
  pentacles: { finance: 1, love: 0, career: 1 }
}

const ASPECT_SALT: Record<DailyFortuneAspect, number> = {
  finance: 2,
  love: 5,
  career: 8
}

function clampScore(value: number): number {
  return Math.min(5, Math.max(1, value))
}

function cardVariation(deckOrder: number, aspect: DailyFortuneAspect): number {
  return ((deckOrder + ASPECT_SALT[aspect]) % 3) - 1
}

export function buildDailyFortune(
  card: Pick<TarotCard, 'deckOrder' | 'suit' | 'yesNo'>
): DailyFortuneItem[] {
  const base = BASE_SCORE[card.yesNo]

  return (['finance', 'love', 'career'] as const).map((aspect) => ({
    aspect,
    score: clampScore(
      base + cardVariation(card.deckOrder, aspect) + (card.suit ? SUIT_AFFINITY[card.suit][aspect] : 0)
    )
  }))
}
