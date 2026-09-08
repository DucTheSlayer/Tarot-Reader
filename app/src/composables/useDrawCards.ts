import { getCardsSnapshot } from '../stores/cardStore'
import type { TarotCard } from '../types/tarotCard'

function shuffle(list: readonly TarotCard[], random: () => number): TarotCard[] {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function drawCardsFromDeck(
  cards: readonly TarotCard[],
  count: number,
  random: () => number = Math.random
): TarotCard[] {
  if (!Number.isInteger(count) || count < 0) {
    throw new Error('Card count must be a non-negative integer')
  }

  return shuffle(cards, random).slice(0, count)
}

export function useDrawCards() {
  const draw = (count: number): TarotCard[] => drawCardsFromDeck(getCardsSnapshot(), count)

  return { draw }
}
