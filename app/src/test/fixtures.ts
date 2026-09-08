import type { TarotCard } from '../types/tarotCard'

export function createTarotCard(overrides: Partial<TarotCard> = {}): TarotCard {
  const deckOrder = overrides.deckOrder ?? 0

  return {
    id: `card-${deckOrder}`,
    deckOrder,
    arcanaType: 'major',
    majorNumber: deckOrder,
    suit: null,
    rankNumber: null,
    name: `Card ${deckOrder}`,
    image: `/cards/card-${deckOrder}.svg`,
    meaning: `Meaning ${deckOrder}`,
    advice: `Advice ${deckOrder}`,
    yesNo: 'yes',
    yesNoMeaning: `Why ${deckOrder}`,
    ...overrides
  }
}

export function createDeck(size: number): TarotCard[] {
  return Array.from({ length: size }, (_, index) => createTarotCard({ deckOrder: index }))
}
